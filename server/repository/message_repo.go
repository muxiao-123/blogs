package repository

import (
	"context"
	"time"

	"blog-server/config"
	"blog-server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"github.com/google/uuid"
)

type MessageRepository struct {
	collection *mongo.Collection
}

func NewMessageRepository() *MessageRepository {
	return &MessageRepository{
		collection: config.GetDB().Collection("messages"),
	}
}

func (r *MessageRepository) CreateMessage(msg *models.Message) (*models.Message, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	msg.MessageID = uuid.New().String()
	msg.CreatedAt = time.Now()
	msg.IsRead = false

	_, err := r.collection.InsertOne(ctx, msg)
	if err != nil {
		return nil, err
	}
	return msg, nil
}

func (r *MessageRepository) GetConversation(userID, otherUserID string, limit, skip int) ([]models.Message, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"senderId": userID, "receiverId": otherUserID},
			{"senderId": otherUserID, "receiverId": userID},
		},
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetLimit(int64(limit))

	if skip > 0 {
		opts.SetSkip(int64(skip))
	}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}

	// Reverse to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (r *MessageRepository) GetConversations(userID string) ([]models.Conversation, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all unique conversations
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"$or": []bson.M{
				{"senderId": userID},
				{"receiverId": userID},
			},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "createdAt", Value: -1}}}},
		{{Key: "$group", Value: bson.M{
			"_id": bson.M{
				"$cond": []interface{}{
					bson.M{"$eq": []string{"$senderId", userID}},
					"$receiverId",
					"$senderId",
				},
			},
			"otherUsername": bson.M{"$first": bson.M{
				"$cond": []interface{}{
					bson.M{"$eq": []string{"$senderId", userID}},
					"$receiverUsername",
					"$senderUsername",
				},
			}},
			"otherAvatar": bson.M{"$first": bson.M{
				"$cond": []interface{}{
					bson.M{"$eq": []string{"$senderId", userID}},
					"$receiverAvatar",
					"$senderAvatar",
				},
			}},
			"unreadCount": bson.M{"$sum": bson.M{
				"$cond": []interface{}{
					bson.M{
						"$and": []bson.M{
							bson.M{"$eq": []string{"$receiverId", userID}},
							bson.M{"$eq": []interface{}{"$isRead", false}},
						},
					},
					1,
					0,
				},
			}},
			// 添加更多字段用于构建 LastMessage
			"lastMsgId": bson.M{"$first": "$messageId"},
			"lastMsgContent": bson.M{"$first": "$content"},
			"lastMsgTime": bson.M{"$first": "$createdAt"},
			"lastMsgIsRead": bson.M{"$first": "$isRead"},
			"lastMsgSenderId": bson.M{"$first": "$senderId"},
			"lastMsgRcvrId": bson.M{"$first": "$receiverId"},
			"lastMsgSndName": bson.M{"$first": "$senderUsername"},
			"lastMsgRcvName": bson.M{"$first": "$receiverUsername"},
			"lastMsgSndAvatar": bson.M{"$first": "$senderAvatar"},
			"lastMsgRcvAvatar": bson.M{"$first": "$receiverAvatar"},
		}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []struct {
		OtherID        string    `bson:"_id"`
		OtherUsername  string    `bson:"otherUsername"`
		OtherAvatar    string    `bson:"otherAvatar"`
		UnreadCount    int       `bson:"unreadCount"`
		LastMsgID      string    `bson:"lastMsgId"`
		LastMsgContent string    `bson:"lastMsgContent"`
		LastMsgTime    time.Time `bson:"lastMsgTime"`
		LastMsgIsRead  bool      `bson:"lastMsgIsRead"`
		LastMsgSender  string    `bson:"lastMsgSenderId"`
		LastMsgRcvr    string    `bson:"lastMsgRcvrId"`
		LastMsgSndName string    `bson:"lastMsgSndName"`
		LastMsgRcvName string    `bson:"lastMsgRcvName"`
		LastMsgSndAv   string    `bson:"lastMsgSndAvatar"`
		LastMsgRcvAv   string    `bson:"lastMsgRcvAvatar"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return []models.Conversation{}, nil
	}

	conversations := make([]models.Conversation, len(results))
	for i, r := range results {
		// 构建 LastMessage
		lastMsg := &models.Message{
			ID:                primitive.NilObjectID,
			MessageID:         r.LastMsgID,
			Content:           r.LastMsgContent,
			IsRead:            r.LastMsgIsRead,
			CreatedAt:         r.LastMsgTime,
		}
		// 设置发送者和接收者信息
		lastMsg.SenderID = r.LastMsgSender
		lastMsg.SenderUsername = r.LastMsgSndName
		lastMsg.SenderAvatar = r.LastMsgSndAv
		lastMsg.ReceiverID = r.LastMsgRcvr
		lastMsg.ReceiverUsername = r.LastMsgRcvName

		conversations[i] = models.Conversation{
			UserID:      r.OtherID,
			Username:    r.OtherUsername,
			Avatar:      r.OtherAvatar,
			LastMessage: lastMsg,
			UnreadCount: r.UnreadCount,
		}
	}

	return conversations, nil
}

func (r *MessageRepository) GetUnreadCount(userID string) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return r.collection.CountDocuments(ctx, bson.M{
		"receiverId": userID,
		"isRead":     false,
	})
}

func (r *MessageRepository) MarkAsRead(userID, senderID string) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.collection.UpdateMany(
		ctx,
		bson.M{
			"receiverId": userID,
			"senderId":   senderID,
			"isRead":     false,
		},
		bson.M{"$set": bson.M{"isRead": true}},
	)

	if err != nil {
		return 0, err
	}
	return result.ModifiedCount, nil
}

func (r *MessageRepository) MarkAllAsRead(userID string) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.collection.UpdateMany(
		ctx,
		bson.M{
			"receiverId": userID,
			"isRead":     false,
		},
		bson.M{"$set": bson.M{"isRead": true}},
	)

	if err != nil {
		return 0, err
	}
	return result.ModifiedCount, nil
}

func (r *MessageRepository) DeleteMessage(messageID, userID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Can only delete messages sent by the user
	result, err := r.collection.DeleteOne(ctx, bson.M{
		"messageId": messageID,
		"senderId":  userID,
	})

	if err != nil {
		return false, err
	}
	return result.DeletedCount > 0, nil
}

// CommentRepository 评论仓储
type CommentRepository struct {
	collection *mongo.Collection
}

func NewCommentRepository() *CommentRepository {
	return &CommentRepository{
		collection: config.GetDB().Collection("comments"),
	}
}

func (r *CommentRepository) AddComment(articleID string, comment *models.Comment) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	doc := bson.M{
		"id":         comment.ID,
		"articleId":  articleID,
		"author":     comment.Author,
		"content":    comment.Content,
		"createTime": comment.CreateTime,
		"likes":      comment.Likes,
		"isRead":     comment.IsRead,
	}

	_, err := r.collection.InsertOne(ctx, doc)
	return err
}

func (r *CommentRepository) DeleteComment(articleID, commentID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.collection.DeleteOne(ctx, bson.M{
		"articleId": articleID,
		"id":        commentID,
	})

	if err != nil {
		return false, err
	}
	return result.DeletedCount > 0, nil
}

func (r *CommentRepository) ToggleLike(articleID, commentID string) (*models.Comment, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var comment models.Comment
	err := r.collection.FindOne(ctx, bson.M{"articleId": articleID, "id": commentID}).Decode(&comment)
	if err != nil {
		return nil, err
	}

	newLikes := comment.Likes + 1
	_, err = r.collection.UpdateOne(
		ctx,
		bson.M{"articleId": articleID, "id": commentID},
		bson.M{"$set": bson.M{"likes": newLikes}},
	)

	if err != nil {
		return nil, err
	}

	comment.Likes = newLikes
	return &comment, nil
}

func (r *CommentRepository) GetCommentsByArticleID(articleID string) ([]models.Comment, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "createTime", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"articleId": articleID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []models.Comment
	if err := cursor.All(ctx, &comments); err != nil {
		return nil, err
	}
	return comments, nil
}

func (r *CommentRepository) UpdateComment(articleID, commentID string, updates bson.M) (*models.Comment, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"articleId": articleID, "id": commentID},
		bson.M{"$set": updates},
	)

	if err != nil {
		return nil, err
	}

	var comment models.Comment
	err = r.collection.FindOne(ctx, bson.M{"articleId": articleID, "id": commentID}).Decode(&comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}
