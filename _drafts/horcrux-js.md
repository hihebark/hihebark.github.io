---
layout: post
title:  "Horcrux-js"
date:   2020-01-05 12:32:45 +0100
tag: [node.js, module, crypto]
categories: tech
---
# Horcrux

At the beginning I didn't develop the main idea, but the idea was developed by [jesseduffield](https://github.com/jesseduffield) under the same name [Horcrux](https://github.com/jesseduffield/horcrux) written in [Go](https://golang.org/), [harry potter](https://harrypotter.fandom.com/wiki/Horcrux) fun wil get this. And to not forget the algorithm was created by [Adi Shamir](https://en.wikipedia.org/wiki/Adi_Shamir) the algorithm is named [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing) you can find an exemple on how the algorithm work and POC of the algorithm writen in Python.

## Concept
The idea is to split a large file into encrypted Horcruxes (files), so if a snoop want to take a look at the content of the Horcruxes he must have all the Horcruxes or just a threshold of them to bind the original file, it depends on how you configured the tool, you can choose that the threshold must equal the Horcruxes if you have sensitive data.

This tool has no security feature if you put all the Horcruxes into the same folder. The best way is to disperse the obtained file in different folders on the hard-drive or put a part of them in a secure server.
<p align="center">
  <a href="{{ site.baseurl }}/assets/images/horcrux-concept.png" style="text-decoration: none">
    <img src="{{ site.baseurl }}/assets/images/horcrux-concept.png" width="300px" alt="describing the main concept">
    image from jesseduffield/horcrux project.
  </a>
</p>

## Implementation
I'am choosing `node.js` as language to write the implementation cause i didn't write a module with `node.js` before.
After reading the project by jesseduffield and found a great module for `Shamir Secret Sharing` called [secrets.js-grempe](https://github.com/grempe/secrets.js) at the begining i was rewriting it by myself, but i dont have time (perhapse another time). I started creating a class ```Horcrux``` that have ```split``` and ```bind``` as method, ```Horcrux``` take as a parametre options(**Object**) like so:
```javascript
new Horcrux({
  filename: 'secret_diary.txt',
  output: './secret_diary_folder/',
  parts: 5,
  threshold: 5
});
```
Form now i had all i need from the user (_me_). I started with ```split```, the split method start creating new random secret using **secrets.js-grempe**, i was giving `32` as a a parametre but it was giving me `32 bit` and i wanted `32 bytes` so give it `secrets.random(128)` 
