{ pkgs ? import <nixpkgs> { } }:
rec {
  blockfrost-yoroi-bridge =
  let
    project = pkgs.callPackage ./yarn-project.nix {
      nodejs = pkgs.nodejs-14_x;
    } { src = pkgs.lib.cleanSource ./.; };

  in project.overrideAttrs (oldAttrs: rec {

    name = "blockfrost-yoroi-bridge";

    PUPPETEER_SKIP_DOWNLOAD = "true";
    HOME = "/build";

    buildPhase = ''
      yarn build

      mkdir -p $out/bin
      cat <<EOF > $out/bin/${name}
      #!${pkgs.runtimeShell}
      ${pkgs.nodejs}/bin/node --require "$out/libexec/source/.pnp.cjs" $out/libexec/source/dist/server.js
      EOF
      chmod +x $out/bin/${name}
    '';

  });
}
