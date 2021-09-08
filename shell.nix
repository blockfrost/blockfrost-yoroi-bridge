with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "blockfrost-yoroi-bridge";
  buildInputs = [
    chromium
    nodejs-14_x
    (yarn.override { nodejs = nodejs-14_x; })
  ];

    shellHook = ''
    export PATH="$PATH:$(pwd)/node_modules/.bin"
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
    export PUPPETEER_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
    #export PUPPETEER_EXECUTABLE_PATH=${pkgs.firefox}/bin/firefox
  '';
}
