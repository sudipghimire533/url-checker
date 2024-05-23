# Url existance checker
Check for url sementic and it's existance

# How to run
## REQUIREMENTS:
* Nodejs
* Tailwind
* Typescript
* Tailwindcss

## STEPS:
From root directory:
1) build tailwind
```bash
npx tailwindcss -i front-end/src/tailwind-input.css -o front-end/dist/tailwind.css
```

2) Compile Typescript
```
tsc --outDir front-end/dist/ front-end/src/*.ts
```

3) Start a local server
* With Php:
```
php -S localhost:8000
```

* Or with python:
```
python3 -m http.server 
```

* Open in browser:
```
http://0.0.0.0:8000/front-end/src/index.html
```

## Caviates
I assume main intent of this assignment is to see how I perform and thing through purpose.
There are many things left unconsidered for simplicity purpose. If you would like to discuss anything in specific
in further more details, I am open to take questions.