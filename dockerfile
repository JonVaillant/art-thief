FROM public.ecr.aws/lambda/nodejs:16 as builder
WORKDIR /usr/app

COPY package.json tsconfig.json  ./
COPY src ./src
RUN npm install --omit=dev
RUN npm run build


FROM public.ecr.aws/lambda/nodejs:16
WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=builder /usr/app/dist/* ./
RUN mkdir ./node_modules
COPY --from=builder /usr/app/node_modules ./node_modules
CMD ["index.handler"]
