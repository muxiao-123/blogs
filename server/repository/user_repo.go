package repository

import (
	"context"
	"time"

	"blog-server/config"
	"blog-server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		collection: config.GetDB().Collection("users"),
	}
}

func (r *UserRepository) CreateIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "username", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(user *models.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) Update(id string, updates bson.M) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := r.collection.FindOneAndUpdate(ctx, bson.M{"id": id}, bson.M{"$set": updates}, opts).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) AddFavorite(userID, articleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"id": userID},
		bson.M{"$addToSet": bson.M{"favorites": articleID}},
		opts,
	).Decode(&user)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) RemoveFavorite(userID, articleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"id": userID},
		bson.M{"$pull": bson.M{"favorites": articleID}},
		opts,
	).Decode(&user)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetFavorites(userID string) ([]string, error) {
	user, err := r.FindByID(userID)
	if err != nil || user == nil {
		return []string{}, nil
	}

	if user.Favorites == nil {
		return []string{}, nil
	}
	return user.Favorites, nil
}

func (r *UserRepository) AddLike(userID, articleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"id": userID},
		bson.M{"$addToSet": bson.M{"likes": articleID}},
		opts,
	).Decode(&user)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) RemoveLike(userID, articleID string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"id": userID},
		bson.M{"$pull": bson.M{"likes": articleID}},
		opts,
	).Decode(&user)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetLikes(userID string) ([]string, error) {
	user, err := r.FindByID(userID)
	if err != nil || user == nil {
		return []string{}, nil
	}

	if user.Likes == nil {
		return []string{}, nil
	}
	return user.Likes, nil
}

func (r *UserRepository) Search(query string, limit int) ([]models.UserResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetLimit(int64(limit))
	cursor, err := r.collection.Find(ctx, bson.M{"username": bson.M{"$regex": query, "$options": "i"}}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	responses := make([]models.UserResponse, len(users))
	for i, u := range users {
		responses[i] = u.ToResponse()
	}
	return responses, nil
}

func (r *UserRepository) FindByIDWithoutPassword(id string) (*models.UserResponse, error) {
	user, err := r.FindByID(id)
	if err != nil || user == nil {
		return nil, nil
	}
	resp := user.ToResponse()
	return &resp, nil
}
