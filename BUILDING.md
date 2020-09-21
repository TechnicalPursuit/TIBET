# Building TIBET

    NOTE: If you're consuming TIBET but not altering its source you do not need
    to run the build commands outlined here. See `tibet help clone` instead.

---

<br/>

### Prerequisites

To build TIBET you'll first need a development-friendly copy.

Follow the instructions for <a href="https://github.com/TechnicalPursuit/TIBET/blob/master/INSTALL.md#installing-tibet-via-git">Installing TIBET via Git</a>.

<br/>

### To build TIBET itself

If you're working on changes to the TIBET source code you'll need to issue a
`tibet build` command to bundle those changes into new deployable assets. These
new assets can then be consumed by TIBET projects linked to your working
directory via `npm link tibet`.

From within the TIBET source code tree run:

```
$ tibet build
```

Issuing a `tibet build` command will cause TIBET to clean any build caches,
lint, rollup (concat/minify), and then compress the various build assets.

<br/>

### Building TIBET Dependencies

    NOTE: You will almost never need to build the underlying dependencies for
    TIBET once you've performed an initial installation via Git.

If you are contributing to TIBET and need to build new versions of TIBET's
dependencies (found in TIBET/deps) use `tibet build_deps`.

NOTE: this command can take quite some time and should only be done if you are
very familiar with lower-level development including a variety of builds.

```
tibet build_deps
```

<br/>

### Building "Everything"

```
tibet build_all
```


<br/>

---

###### For full TIBET documentation see the <a href="https://github.com/TechnicalPursuit/TIBET">README</a> and <a href="https://www.technicalpursuit.com/docs/">https://technicalpursuit.com</a>.
