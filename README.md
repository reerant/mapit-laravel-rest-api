# MapIt Laravel Rest API <br><br> 
- Uses Google Maps API<br>
- Client side created with HTML, JavaScript and CSS <br>
- Server side/API created with Laravel<br><br>
User can add new places on the map with title and description information, update the information or delete the marker.
User can also search from added places by the title.<br><br>
Installation<br><br>
Server:<br>
- Clone the project<br>
- Go to project folder --> mapit --> server and then install composer <br>
- Install XAMPP <br>
- Create a copy of your .env.example file and name it .env<br>
- Generate an app encryption key which will be stored in .env file --> Terminal: php artisan key:generate<br>
- Create an empty database for your application<br>
- In the .env file, add database information --> fill in the DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, and DB_PASSWORD options to match the credentials of the database you created<br>
- Migrate the database --> Terminal: php artisan migrate<br>
- Terminal: php artisan serve<br><br>
Client:<br>
- Get your own Google Maps API key: https://developers.google.com/maps/documentation/javascript/get-api-key<br>
- Go to folder --> mapit --> client and open index.html with any code editor and replace YOUR_API_KEY in src with your own key and save it (src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing&callback=initMap")<br>
