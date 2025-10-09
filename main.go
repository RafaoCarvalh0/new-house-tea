package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rafaelcarvalho/new-house-tea/controllers"
	"github.com/rafaelcarvalho/new-house-tea/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Initialize database
	db, err := gorm.Open(sqlite.Open("gifts.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(&models.Gift{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize router
	router := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5500"} // Adjust this according to your frontend URL
	router.Use(cors.New(config))

	// Initialize controller
	giftController := controllers.NewGiftController(db)

	// Define routes
	router.GET("/gifts", giftController.ListGifts)
	router.POST("/gifts/:id/reserve", giftController.ReserveGift)

	// Start server
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}