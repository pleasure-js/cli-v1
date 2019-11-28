# Build deployment server

```sh
docker image build --tag deployment:node - < Dockerfile-keepwondering
```

# Build deployment nginx server

```sh
docker image build --tag deployment:nginx - < Dockerfile-keepwondering-nginx
```

# Publishing image to docker repo

```sh
docker tag deployment:node keepwondering/deployment:node
```

```sh
docker tag deployment:nginx keepwondering/deployment:nginx
```
