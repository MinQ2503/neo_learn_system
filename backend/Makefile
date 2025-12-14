build:
	@go build -o bin/backend cmd/main.go

test:
	@go test -v ./...

run: build
	@./bin/backend



# ================
# CONFIG
# ================

DB_USER = neo_user
DB_PASS = NeoLearn@123
DB_HOST = localhost
DB_PORT = 3306
DB_NAME = neo_learn_system_db
DB_DSN  = "mysql://$(DB_USER):$(DB_PASS)@tcp($(DB_HOST):$(DB_PORT))/$(DB_NAME)?multiStatements=true"

MIGRATE_DIR = cmd/migrate/migrations

# ================
# COMMAND ALIASES
# ================
MIGRATE = migrate -path $(MIGRATE_DIR) -database $(DB_DSN) -verbose


# ================
# MIGRATE COMMANDS
# ================

## Tạo migration mới: make create name=create_users
create:
	@mkdir -p $(MIGRATE_DIR)
	migrate create -ext sql -dir $(MIGRATE_DIR) -seq $(name)

## Chạy migration lên
up:
	$(MIGRATE) up

## Chạy migration xuống 1 bước
down:
	$(MIGRATE) down 1

## Chạy full rollback
down-all:
	$(MIGRATE) down

## Reset DB: drop + up từ đầu
reset:
	$(MIGRATE) drop -f
	$(MIGRATE) up

## Xem version hiện tại
version:
	$(MIGRATE) version

## Fix khi migrate lỗi (dirty)
force:
	$(MIGRATE) force $(version)
