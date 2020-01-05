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
I choose to write this module with node.js because i have a privat project that need this solution and need it as a package. Before seeing this idea i was thinking to encrypt each file alone, but with this i will be able to do that with just one line of code.
