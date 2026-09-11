FROM nginx:stable-alpine-perl

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY ./public /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]