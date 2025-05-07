# Dockerfile cho Kong
FROM kong:latest

# Cài đặt các plugin tùy chỉnh (nếu cần)
# Sử dụng LuaRocks (package manager cho Lua)
RUN luarocks install lua-cjson
RUN luarocks install lua-resty-jwt

# Sao chép các file config vào image
COPY ./config /usr/local/kong/declarative/

# Sao chép các custom plugin nếu có
COPY ./custom-plugins /usr/local/kong/custom-plugins/

# Cấu hình môi trường
ENV KONG_DATABASE=postgres
ENV KONG_PLUGINS=bundled,custom-auth
ENV KONG_LUA_PACKAGE_PATH=/usr/local/kong/custom-plugins/?.lua;./?.lua

# Cài đặt các tùy chọn khác nếu cần
EXPOSE 8000 8001 8443 8444

# Khởi động Kong
CMD ["kong", "docker-start"]