Power Of Knoydart
===============
This website has been developed as part of a collaboration between Univesity of Edinburgh, Knoydart Foundation, Community Energy Scotland and Local Energy Scotland.

The visualisation can be found currently at
http://powerofknoydart.org

# How to edit the wesite:

First Login to ithub with the community username and password.
The process of editing the website has three stages:
- Find the file you want to edit, open it here on github and click on edit.
- Add your changes to the file.
- Commit your changes to github by using the commit space at the bottom of the page you're editing your file from.


## Website structure:

The power of Knoydart website consists of three main files
  
- Index.html
- Style.css
- js/vis_d3.js

**Index.html** file holds the structure of the page, like the Knoydart foundation logo, visualisation on the left and info on the right side of the page.
**Style.css** consists of design elements, like color of information block, background color, font style and so on.
**vis_d3.j** takes care of things like fetching the data from the tracker, drawing the graph, responding to user mouse clicks on different buttons, and it also have the list of situations to show at the bottom of the info window, for example when it says "feel free to use as much energy as you like". 

Before editing any of these three files, **first** it is important to separate your tasks and things you want to change make sure which file you need to edit in order to add your changes.

for example, you want to get rid of a section on the page and change the background color to light green. The deleting section change will be part of the index.html file and the color needs to be changed by using the style.css files.

### Where to find each of these files

The **index.html** and **style.css** are both in the root of this repository. and the **vis_d3.js** is inside the **js** folder.

### Examples:
Changing background color:

For example to change the background color of the page and the text color this is what you need to do:

- Click on **style.css**
- click on edit so you can start adding your changes 
- Commit your changes

This is the section in the **style.css** you want to add for the background color:

'''css
body{
background-color: #000;
}
'''

## Developing your own app

If you would like to develop you own app, please go to our githubu page for more details on the data api and our privacy and licence agreements.


