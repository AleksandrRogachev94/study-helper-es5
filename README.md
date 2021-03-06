# Study Helper

[Site on heroku](http://studyhelper.herokuapp.com)

[Blog Post about this application](http://aleksandr-rogachev-blog.com/2017/04/22/study_helper_part_2/)

This web app was made to simplify studing for both students and teachers. Teachers can store there materials privately and open access only to students they want. Students can add users as teachers and access their material.

![Schema](/schema.pdf?raw=true "Schema")


## Installation

Clone the repository and then execute:

    $ bundle

Install postgresql on your system, create environmental variables PG_USER and PG_PASS.

## Usage

This guide is about running this application **locally** (in development environment).
Execute:

    $ rake db:migrate

If you want, you can use fake data from db/seeds.rb (you can see all necessary data including password in this file). Execute:

    $ rake db:seed

To start the server execute:

    $ rails s

Go to http://localhost:3000.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/AleksandrRogachev94/study-helper. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.


## License

This Web Application is available as open source under the terms of the [Apache License](http://www.apache.org/licenses/).
