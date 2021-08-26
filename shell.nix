with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "blockfrost-yoroi-bridge";
  buildInputs = [
    nodejs-14_x
    (yarn.override { nodejs = nodejs-14_x; })
  ];
}
