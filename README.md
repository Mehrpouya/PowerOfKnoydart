Power Of Knoydart
===============
This website has been developed as part of a collaboration between Univesity of Edinburgh, Knoydart Foundation, Community Energy Scotland and Local Energy Scotland.

The visualisation can be found currently at
http://powerofknoydart.org

# How to edit the wesite:

Login to Github with the community username and password.

The process of editing the website has three stages (explained in greater detail below):
- Find the file you want to edit, open it and click Edit.
- Add your changes to the file.
- Commit your changes by using the 'Commit' space at the bottom of the page.


## Website structure:

The power of Knoydart website consists of three main files
  
- [index.html](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/index.html)
- [style.css](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/style.css)
- [js/vis_d3.js](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/js/vis_d3.js)

[index.html](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/index.html) file holds the structure of the page, like the Knoydart foundation logo, visualisation on the left and info on the right side of the page.

[style.css](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/style.css) consists of design elements, like color of information block, background color, font style and so on.

[vis_d3.j](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/js/vis_d3.js) takes care of things like fetching the data from the datataker, drawing the graph, responding to user mouse clicks on different buttons, and presenting different messages in the info window, for example when it says "feel free to use as much energy as you like". 

Before editing any of these three files, **first** it is important to separate your tasks and make sure which file you need to edit.

For example, if you want to delete a section of text on the page and change the background color to light green. The deleting section change needs to take place in the index.html file and the color change needs to take place in the style.css files.

### Where to find each of these files

The [index.html](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/index.html) and [style.css](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/style.css) are both in the root of this repository. and the [vis_d3.js](https://github.com/Mehrpouya/PowerOfKnoydart/edit/master/js/vis_d3.js) is inside the [js](https://github.com/Mehrpouya/PowerOfKnoydart/tree/master/js) folder.

### Examples:
To change the text in the green box (the text in this box stays the same regardless of what the hydro is doing):
-Click on **index.html**

Changing background color:

For example to change the background color of the page and the text color this is what you need to do:

- Click on **style.css**
- click on edit so you can start adding your changes 
- Commit your changes

This is the section in the **style.css** you want to change for the background color, font or font-size:

``` css
body{ 
    font-size: 87.5%;
    color: #252e35; 
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
    line-height: 1.5em;
    background: #f00;  
}
```

## Developing your own app

If you would like to develop you own app, please go to our githubu page for more details on the data api and our privacy and licence agreements.


