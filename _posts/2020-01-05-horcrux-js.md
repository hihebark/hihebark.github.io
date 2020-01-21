---
layout: post
title:  "/Posts/Horcrux-js"
date:   2020-01-05 12:32:45 +0100
tag: [dev, node.js, module, crypto]
categories: dev
comments: true
---
# Horcrux
At the beginning I didn't develop the main idea, but the idea was developed by [jesseduffield](https://github.com/jesseduffield) under the same name [Horcrux](https://github.com/jesseduffield/horcrux) written in [Go](https://golang.org/), [harry potter](https://harrypotter.fandom.com/wiki/Horcrux) fun wil get this. And to not forget the algorithm was created by [Adi Shamir](https://en.wikipedia.org/wiki/Adi_Shamir) the algorithm is named [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing) you can find an exemple on how the algorithm work and POC of the algorithm writen in Python.

## Concept
The idea is to split a large file into encrypted Horcruxes (files), so if a snoop want to take a look at the content of the Horcruxes he must have all the Horcruxes or just a threshold of them to bind the original file, it depends on how you configured the tool, you can choose that the threshold must equal the Horcruxes if you have sensitive data.

This tool has no security feature if you put all the Horcruxes into the same folder. The best way is to disperse the obtained file in different folders on the hard-drive or put a part of them in a secure server.
<p align="center">
  <img src="{{ site.baseurl }}/assets/images/horcrux-concept.png" width="300px" alt="describing the main concept">
  image from jesseduffield/horcrux
</p>

## Implementation
I'am choosing `node.js` as a language to write the implementation cause I didn't write a package with `node.js` before.
After reading the project by jesseduffield and found a great module for `Shamir Secret Sharing` called [secrets.js-grempe](https://github.com/grempe/secrets.js) at first I was rewriting it by myself, but I didn't have time (perhaps another time). I started creating a class `Horcrux` that have `split` and `bind` as a method, `Horcrux` take as a parameter options(__Object__):

```javascript
new Horcrux({
  filename: 'secret_diary.txt',
  output: './secret_diary_folder/',
  parts: 5,
  threshold: 5
});
```

Form now i had all i need from the user (_me_). I started with `split`, the split method start creating new random secret using __secrets.js-grempe__, with: `secrets.random(128)`. Now we need to loop over each parts and creating the header, the header is just a json like so:

```json
{
    "originalFilename": "diary.txt",
    "timestamp":1579294138,
    "index":1,
    "total":5,
    "keyFragment":"8013e036d8c332caba8465e...05c9fc667c65bdc0713d779",
    "threshold":3
}
```

After generating the header i created the Horcruxes files, each one with it's header, Now I needed to encrypt the content of the _(secret)_ file, in the original `horcrux` the developer used `aes-256-ofb`, and I just have that function before but with another algorithm but it the same (and there is stackoverflow). In the end, I appended the encrypted binary to all the Horcruxes.

For the `bind` method, it's just the inverse function of the `split` method like so: reading all `Horcruxes` in a directory, extract the header verifying the `Timestamp` and the `OriginalFilename` if they are the same, then get collect all the keyFragment and combine it `secrets.combine(keyFragments)` where keyFragments is an array of keys, and then reading the body of the file and decrypt it using the same algorithm and combined key plus the `iv`.

I published the tool on [github](https://github.com/hihebark/horcrux-js) and [npm](https://www.npmjs.com/package/horcrux-js) for test only because there is a lot of issues that i noticed, the first issue is sometime the output of the decrypted horcrux file it'n not equal to the orginal file so test it on your own risk.

### Benchmark

```bash
$ time node test.js
0.35s user 0.03s system 65% cpu 0.581 total
```
