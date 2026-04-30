package repository

import (
	"context"
	"log"
	"time"

	"blog-server/config"
	"blog-server/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ArticleRepository struct {
	collection *mongo.Collection
}

func NewArticleRepository() *ArticleRepository {
	return &ArticleRepository{
		collection: config.GetDB().Collection("articles"),
	}
}

func (r *ArticleRepository) CreateIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "id", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "category", Value: 1}}},
		{Keys: bson.D{{Key: "tags", Value: 1}}},
		{Keys: bson.D{{Key: "publishDate", Value: -1}}},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, indexes)
	return err
}

func (r *ArticleRepository) FindAll() ([]models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "publishDate", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *ArticleRepository) FindByID(id string) (*models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var article models.Article
	err := r.collection.FindOne(ctx, bson.M{"id": id}).Decode(&article)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &article, nil
}

func (r *ArticleRepository) FindByCategory(category string) ([]models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "publishDate", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"category": category}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *ArticleRepository) FindByTag(tag string) ([]models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "publishDate", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"tags": tag}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *ArticleRepository) FindByAuthor(authorName string) ([]models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "publishDate", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"author.name": authorName}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *ArticleRepository) CountByAuthor(authorName string) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return r.collection.CountDocuments(ctx, bson.M{"author.name": authorName})
}

func (r *ArticleRepository) Search(query string) ([]models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": query, "$options": "i"}},
			{"excerpt": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	opts := options.Find().SetSort(bson.D{{Key: "publishDate", Value: -1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var articles []models.Article
	if err := cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	return articles, nil
}

func (r *ArticleRepository) Create(article *models.Article) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("ArticleRepository.Create called, collection:", r.collection, "article ID:", article.ID)
	_, err := r.collection.InsertOne(ctx, article)
	if err != nil {
		log.Printf("InsertOne error: %v", err)
	} else {
		log.Println("InsertOne success for article:", article.ID)
	}
	return err
}

func (r *ArticleRepository) Update(id string, updates bson.M) (*models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var article models.Article
	err := r.collection.FindOneAndUpdate(ctx, bson.M{"id": id}, bson.M{"$set": updates}, opts).Decode(&article)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &article, nil
}

func (r *ArticleRepository) Delete(id string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.collection.DeleteOne(ctx, bson.M{"id": id})
	if err != nil {
		return false, err
	}
	return result.DeletedCount > 0, nil
}

func (r *ArticleRepository) GetAllTags() ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{}, options.Find().SetProjection(bson.M{"tags": 1}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	tagSet := make(map[string]bool)
	for cursor.Next(ctx) {
		var doc struct {
			Tags []string `bson:"tags"`
		}
		if err := cursor.Decode(&doc); err != nil {
			continue
		}
		for _, tag := range doc.Tags {
			tagSet[tag] = true
		}
	}

	tags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		tags = append(tags, tag)
	}
	return tags, nil
}

func (r *ArticleRepository) InitData(articles []models.Article) error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	count, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return err
	}

	if count == 0 {
		log.Println("Initializing articles data...")
		docs := make([]interface{}, len(articles))
		for i := range articles {
			docs[i] = articles[i]
		}
		_, err = r.collection.InsertMany(ctx, docs)
		if err != nil {
			return err
		}
		log.Printf("Inserted %d articles", len(articles))
	}
	return nil
}

func (r *ArticleRepository) IncrementViews(id string) (*models.Article, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	article, err := r.FindByID(id)
	if err != nil || article == nil {
		return nil, err
	}

	newViews := article.Views + 1
	lastViewedAt := time.Now().Format(time.RFC3339)

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated models.Article
	err = r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"id": id},
		bson.M{"$set": bson.M{"views": newViews, "lastViewedAt": lastViewedAt}},
		opts,
	).Decode(&updated)

	if err != nil {
		return nil, err
	}
	return &updated, nil
}
