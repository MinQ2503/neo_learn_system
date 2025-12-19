package main

import (
	"log"
	"os"
	"strconv"

	config "github.com/MinQ2503/neo_learn_system/backend/configs"
	"github.com/MinQ2503/neo_learn_system/backend/internal/database"
	mysqlDriver "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	mysqlMigrate "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	cfg := mysqlDriver.Config{
		User:                 config.Envs.Database.User,
		Passwd:               config.Envs.Database.Password,
		Addr:                 config.Envs.Database.Host + ":" + config.Envs.Database.Port,
		DBName:               config.Envs.Database.DBName,
		Net:                  "tcp",
		AllowNativePasswords: true,
		ParseTime:            true,
	}

	db, err := database.NewMySQLStorage(cfg)
	if err != nil {
		log.Fatal(err)
	}

	driver, err := mysqlMigrate.WithInstance(db, &mysqlMigrate.Config{})
	if err != nil {
		log.Fatal(err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://cmd/migrate/migrations",
		"mysql",
		driver,
	)
	if err != nil {
		log.Fatal(err)
	}

	v, d, _ := m.Version()
	log.Printf("Version: %d, dirty: %v", v, d)

	if len(os.Args) < 2 {
		log.Fatal("Usage: up | down | force <version>")
	}

	cmd := os.Args[1]

	switch cmd {

	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}
		log.Println("Migration UP applied successfully")

	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			log.Fatal(err)
		}
		log.Println("Migration DOWN applied successfully")

	case "force":
		if len(os.Args) < 3 {
			log.Fatal("Usage: force <version>")
		}

		version, err := strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatal("Invalid version number")
		}

		if err := m.Force(version); err != nil {
			log.Fatal(err)
		}

		log.Printf("Forced migration version to %d", version)

	default:
		log.Fatal("Unknown command. Use: up | down | force <version>")
	}
}
