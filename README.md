# project-mapper

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 4.2.2.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [SQLite](https://www.sqlite.org/quickstart.html)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `gulp build` for building and `gulp serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.

# Using the Application
The data for this application is stored in `WebGIS on GISDB2` under the RPD Schema in the table `rpd.MapApplicatonData`

## Step 1. Check contents of Mapping Table
It may be neccessary to truncate existing features stored in the master table when starting a new mapping project.  To do this, use the command below.

```
truncate table rpd.MapApplicatonData
```
## Step 2. Map Projects
Before mapping any projects lets familiarize ourselves with the inputs required to complete the project mapper process.

Project Name: Choose a category from the drop down list (this can be changed later) .
Project ID: Either click generate to create a universally unique identifier or type your own .
Mapping Info: Choose from the drop-down menu to type of geography to represent your project
From [Enter a location]: First, click the green pin button then navigate to where your project will begin. Be sure to zoom-in as close as possible. Second, click the point on the map to associate the green pin with your map location point.

To [Enter a location]: First, click the green pin button then navigate to where your project will begin. Be sure to zoom-in as close as possible. Second, click the point on the map to associate the green pin with your map location point.

Calculate Route: Click but then adjust the A and B locational pins to more accurately match your original From/To locations 

Save/Add Next: Click

Submit: Click

### WKT String to Shape Geometry
When creating features using the Project Mapper tool, the features are stored in `Well Known Text (WKT) format`.  In order to view these features in ArcGIS mapping software (ArcMap, ArcPro, ArcGIS Online) you will need to convert the WKT string into geometry.  Within the Sql Server Database, this is accomplished using the STGeomFromText converter.  See below for an example of how this is accomplished.  

```
  update rpd.MapApplicatonData
  set 
  Shape = geometry::STGeomFromText(WKT,4326),
  Project = 'Express Lanes'
  Where Shape is null
```

Additionally, you will notice that we have set the `Project Column` in the table to the name of the projects that you are mapping.  In this case we are mapping Express Lane projects, there for we have set the value of the Project for each feature mapped to 'Express Lanes'.

