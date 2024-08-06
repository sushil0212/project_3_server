#SERVER/BACKEND

- USER MODEL
  {
    profilePic: String,
    username: String,
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
     
      createdJob:[{type: Schema.Types.ObjectId, ref:'job'}]
  },


- SAVE MODEL
{
 name: { type: String, required: true },
 description: { type: String, required: true },
 jobId: [ { type: Schema.Types.ObjectId, ref:'Job' } ],
 userId: { type: Schema.Types.ObjectId, ref:'User' },
 }


- JOB MODEL
{
    name: { type: String, required: true },
    description: { type: String, required: true },
    company: {type: String, required: true},
    loacation: {type: String, required: true},
    salary: {type: Number, required: true},
    workingDays: {type: Number, required: true},
    position: {type: String, required: true},
    numberOfEmployees: {type: Number, required: true},
    
}


- SHORT MODEL



API ENDPOINTS (BACKEND ROUTES)


HTTP Method     	URL	            Request Body	             Success status	   Error Status     	Description
GET	           /auth/verify 		                                  200	          404	         Check if token is valid

POST	      /auth/signup	     {name, email, password}	          201	          404	        Checks if fields not empty (422) 
                                                                                                    and user not exists (409), then create user with encrypted password

POST	     /auth/login	     {username, password}	              200	          401	        Checks if fields not empty (422), if
                                                                                                    user exists (404), and if password matches (404), then creates and sends JWT

GET	        /api/job			                                                      400	        Show all job

GET	        /api/job/:id				                                                            Show specific job  (using param)

POST	    /api/job	         { name, description}	              201	          400	        Create and save a new job

PUT	        /api/job/:id         { name, description }	              200	          400	        edit job

DELETE	    /api/job/:id		                                      201	          400	        delete job

GET	        /api/save/:id				                                                            show specific save

POST	    /api/save	        { name, jobId }	                      200	          404	        add save

PUT	        /api/save/:id	   { name, description }	              201	          400	        edit save

DELETE	    /api/save/:id		                                      200	          400	        delete save

GET	        /api/short		                                          201	          400	        show short

GET	        /api/short/:id				                                                            show specific short

POST	    /api/short	         {user,video,like,dislike}			                                add short

PUT	        /api/short/:id	     {user,video}			                                            edit short

Delete	        /api/short/:id	                   			                                        Delete short










#Use 200 for successful GET, PUT, and DELETE requests.
#Use 201 for successful POST requests indicating resource creation.
#Use 400 for bad requests (invalid input data).
#Use 401 for unauthorized access.
#Use 404 for not found resources.
#Use 409 for conflicts (e.g., user already exists).
#Use 422 for unprocessable entities (e.g., missing required fields).
