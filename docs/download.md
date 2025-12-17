# Downloads

<script setup lang="ts">
  import pkg from '../package.json';
</script>

Version {{ pkg.version }}

<ul>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/v${ pkg.version }`">
      Release v{{ pkg.version }}
    </a>
  </li>
</ul>

## Windows

<ul>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-win.exe`">
      Installer (.exe)
    </a>
  </li>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-win.zip`">
      Portable (.zip)
    </a>
  </li>
</ul>

## macOS

All builds are universal (Intel / Sillicon).

<ul>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-mac.dmg`">
      DMG
    </a>
  </li>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-mac.zip`">
      ZIP
    </a>
  </li>
</ul>

## Linux

<ul>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.AppImage`">
      AppImage
    </a>
  </li>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.deb`">
      Debian (.deb)
    </a>
  </li>
  <li>
    <a :href="`https://github.com/nandenjin/obakesan/releases/download/v${ pkg.version }/obakesan-${ pkg.version }-linux.snap`">
      Snap
    </a>
  </li>
</ul>
