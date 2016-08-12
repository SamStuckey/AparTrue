# AparTrue
[AparTrue](aparture.heroku.com) is an online app that that allows users to review apartments they have lived in.  It is build on a rails back end it's front end implemented using React and the FLUX methodology.

## Features
### User Authentication
Sessions are kept secure throughout the stack.  The users password is digested into a secure has for storage, and all back end api calls are validated using cookies.  Front end authentication operates independantly of secure back end information without making unnessecary api calls using a session token, and the user is stored as a variable in the 'Session Store'.

### Fuzzy-finder
Build using Google's places and search box api, the fuzzy finder loads all documented properties from the database and then checks user input for matches.  If a match is found, the user is directd to that properties show page.  If no match is found in the database, the user is transfered to a 'Property Form' where they can submit a new apartment to be reviewed.

### Property Form
An html upload form that is pre-populated with the data returned from the Google Places Search Box.  The user may then add additional information and upload a picture.  Front end validation is performed on all necessary form fields to avoid unnecessary API calls.  The pictures are uploaded using the paperclip gem and hosted on Amazon Web Services.

### Criteria Search
Users can search through properties registered in the database by multiple filter criteria.  The Existing properties are loaded into the 'Property Store' asynchronysly while the user if filling out the form to improve search speed.  When the search form is submitted the new filters are registered to a 'Filter Store' which emits change, causeing the search page to rerender and display a Google Map component and a list of the matching properties.

### Reviews
Users can leave text reviews as well as 'Star' rankings for new or existing properties.  The review is registerd to the database, returning the new average rating for the property which is updated in real time on the page using Activerecord and React.  

### React Modals
Users must be logged in to add reviews.  They can login directly from a properties 'Show Page'.  The login form is implemented using React Modals.
