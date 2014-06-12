cantina-cache
=============

Tag-based caching for cantina apps

Dependencies
------------

If using the provided cache backend:

- [cantina-redis](https://github.com/cantina/cantina-redis)
- [cantina-amino](https://github.com/cantina/cantina-amino)

Provides
--------

- **app.cache** - A [stow](https://github.com/cpsubrian/node-stow) instance that uses
                  a custom backend for cantina applications.
- **app.cacheBackend** - A custom cache backend for cantina application. Uses
                         a memory store (for speed) backed by redis, with
                         multi-process support provided by amino pub/sub.

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Santa Cruz, CA and Washington, D.C.
