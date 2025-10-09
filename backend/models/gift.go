package models

type Gift struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Link        string `json:"link"`
	Description string `json:"description"`
	Reserved    bool   `json:"reserved"`
}
