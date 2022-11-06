FROM public.ecr.aws/lambda/nodejs:latest as builder
WORKDIR /usr/app

COPY package.json tsconfig.json  ./
COPY src ./src
RUN npm install --omit=dev
RUN npm run build


FROM public.ecr.aws/lambda/nodejs:latest
# LAMBDA_TASK_ROOT is currently /var/task
WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/dist ./
RUN mkdir ./node_modules
COPY --from=builder /usr/app/node_modules ./node_modules
CMD ["index.handler"]
