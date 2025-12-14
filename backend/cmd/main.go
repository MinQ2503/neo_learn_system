package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/MinQ2503/neo_learn_system/backend/cmd/api"
	config "github.com/MinQ2503/neo_learn_system/backend/configs"
	db "github.com/MinQ2503/neo_learn_system/backend/internal/database"
	"github.com/go-sql-driver/mysql"
)

func main() {
	cfg := mysql.Config{
		User:                 config.Envs.Database.User,
		Passwd:               config.Envs.Database.Password,
		Addr:                 config.Envs.Database.DBAddress,
		DBName:               config.Envs.Database.DBName,
		Net:                  "tcp",
		AllowNativePasswords: true,
		ParseTime:            true,
	}

	db, err := db.NewMySQLStorage(cfg)
	if err != nil {
		log.Fatal(err)
	}

	initStorage(db)

	server := api.NewAPIServer(fmt.Sprintf(":%s", config.Envs.Server.Port), db)
	if err := server.Run(); err != nil {
		log.Fatal(err)
	}
}

func initStorage(db *sql.DB) {
	err := db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("DB: Successfully connected!")
}
