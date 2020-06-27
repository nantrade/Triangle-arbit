# eplate
Express application boilerplate with simple routing structure. Ideally suited to API microservices.

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![pipeline status](https://gitlab.com/MarcTimperley/eplate/badges/master/pipeline.svg)](https://gitlab.com/MarcTimperley/eplate/commits/master)
[![coverage report](https://gitlab.com/MarcTimperley/eplate/badges/master/coverage.svg)](https://gitlab.com/MarcTimperley/eplate/commits/master)

##### Why another express boilerplate?
This boilerplate doesn't rely on external libraries apart from [chalk](https://github.com/chalk/chalk) and express itself and allows you to simply add routes without worrying about filling the server index. Configuration is externalised into one file, making it simple to adopt and new routes are just dropped into the routes folder...

# Demo
A demonstration of the application can be found [here](https://eplate.herokuapp.com/). This demo is deployed to Heroku using the CI/CD pipeline settings from [Gitlab](https://gitlab.com/MarcTimperley/eplate) on commit.

## Getting Started

  1. Clone or download the project
  2. Modify the `config.js`
  3. Run `npm install` to get all the dependencies
  4. Run `npm start` to start the server

### Prerequisites

- node 8.x +
- npm 6.x +

### Installing

Follow the getting started steps and access the server on the configured port (http://localhost:3000) unless a different port has been specified in the `config.js` file.

Check the server is responding correctly by visiting the `/`, `/example/` and `/serverinfo/` endpoints.

## Using for your boilerplate

 - Follow the steps in _getting started_
 - Disconnect the git repo with `git init`
 - Add your own git repo using `git remote add origin [url]`
 - Push to your repo with `git push --set-upstream origin master`
 - Change the links in this readme.md file as required
 - Add routes in the `routes` folder and their tests in the `__tests__` folder
 - Add static content (html, css, js) inside the public folder
 - If pushing to gitlab for CI/CD to Heroku:
  - Create a new application in Heroku
  - Enter the app name in the `.gitlab-ci.yml` file
  - Enter your Heroku API key in the environment settings in Gitlab
 - Secure the app and server

## Running the tests

To run the tests, jest must be installed.

- run `npm test` to execute the tests. Shipped tests include validation that routes are loaded and the application has been built correctly.

You are _strongly_ encouraged to write your own tests for any functionality and routes you develop. Check `__tests__/example.test.js` for an example.

You should consider using TDD for the development as it can be very beneficial to reduce the coding effort and ensure the stability of the application itself.

## Contributing and Code of Conduct

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the code of conduct, and the process for submitting pull requests.

## Authors

* **Marc Timperley** - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## ToDo

- [ ] Add css/scss
- [ ] Build all test cases
- [ ] Add security
- [ ] Improve automation
 - [ ] Test coverage


## Acknowledgments

*
