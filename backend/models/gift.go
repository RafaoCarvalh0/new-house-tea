package models

type Gift struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Link        string `json:"link"`
	Description string `json:"description"`
	Reserved    bool   `json:"reserved"`
}
