# FROM ubuntu
# RUN apt-get update
# RUN apt-get install nginx -y
# COPY /build /var/www/html/
# EXPOSE 80
# CMD ["nginx","-g","daemon off;"]

FROM node:19.4.0 AS builder

WORKDIR /app

COPY /MySolidityProject/ .

RUN npm install
RUN npm run build

FROM ubuntu
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=builder /app/build /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]