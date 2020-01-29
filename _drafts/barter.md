---
layout: post
title:  "/Posts/Bartering wares (files)"
date:   2020-01-29 22:52:45 +0100
tag: [bartering, http, go, transfert, io]
categories: dev
comments: true
---

<p align="center">
    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2b/Olaus_Magnus_-_On_Trade_Without_Using_Money.jpg" width="400">
</p>

# Bartering files (wares)
Bartering is trading wares without the use of money as explained in [Wikipedia - Barter](https://en.wikipedia.org/wiki/Barter), So the principal idea came to me when i needed to send files between my smart-phone and my laptop and i don't like to plug and unplug thing so why not sending files, memo... over wifi. of course they need to be connected to the same wifi. I knew that there is a multi solution like this, but i didn't bother to search for, like _Richard Feynman_ said:
> What I cannot create, I do not understand.

or [_source_](https://twitter.com/ProfFeynman/status/1221820266994532352)

> You don't really know something until you can rebuild it yourself from basic principles! It's a good approach - learn everything and keep that child - like curiosity, question everything... and be humble enough to admit things that you don't know.

So, we have A and B can be a laptop or a phone or both, the senario is like so:
1 the two endpoints connect to the same wifi.
2 authenticate (to think about it).
3 sign the transaction between the endpoints with `jwt`.
4 transfering (bartering) files.

Traders:
```json
{
    "_id": "uniq, 16 char",
    "token": "string",
}
```
