# Câu lệnh migrate GoLang
Bắt đầu từ folder backend, bạn có thể sử dụng các câu lệnh migrate GoLang sau đây để quản lý cơ sở dữ liệu của mình.

# Tạo một migration mới để cập nhật bảng <name_of_table>:
# Nên đặt theo hành vi bạn muốn thực hiện, ví dụ: add_column_to_<name_of_table>, remove_index_from_<name_of_table>, v.v.
migrate create -ext sql -dir cmd/migrate/migrations update_<name_of_table>

