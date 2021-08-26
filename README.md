<img src="https://blockfrost.io/images/logo.svg" width="250" align="right" height="90">

# Blockfrost-Yoroi Bridge

<br/>

<p align="center">A bridge between <a href="https://blockfrost.io">Blockfrost.io API</a> and <a href="https://github.com/Emurgo/yoroi-frontend">Yoroi Frontend</a>.</p>
<p align="center">
  <a href="#about">About</a> •
  <a href="#getting-started">Getting started</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a>
</p>
<br>


## About

This repository provides a tool, which allows you to run
<a href="https://github.com/Emurgo/yoroi-frontend">Yoroi</a>
without the need of running your own full node backends, as all the data
is being fetched from <a href="https://blockfrost.io">Blockfrost.io</a>.

Endpoint are mirroring <a href="https://github.com/Emurgo/yoroi-graphql-migration-backend">Yoroi GraphQL Migration Backend</a>.

## Getting started

### Blockfrost.io

To use this SDK, you first need to log in to [blockfrost.io](https://blockfrost.io), create your project and retrieve the API token.

<img src="https://i.imgur.com/smY12ro.png">

<br/>

### Yoroi

You'll also need to modify the <a href="https://github.com/Emurgo/yoroi-frontend">Yoroi Frontend</a> a bit
if you want it to connect to custom backend. To do this, change <a href="https://github.com/Emurgo/yoroi-frontend/blob/develop/packages/yoroi-extension/app/api/ada/lib/storage/database/prepackaged/networks.js#L32"> this URL</a> to the URL where you'll run
the bridge. For example, you can use `http://localhost:21000`, same as it's already used for the
test switch, like so:

![image](https://user-images.githubusercontent.com/791309/131033800-db5ccc7d-842f-4bff-8efd-529cec5ee90a.png)

Note: when using testnet, change the appropriate URL in the `Cardano Testnet` section below.

Then, follow their <a href="https://github.com/Emurgo/yoroi-frontend/blob/develop/packages/yoroi-extension/README.md">README</a>
to build and run Yoroi.

## Installation

### `yarn`

```
$ yarn
$ yarn build
```

### `nix`

```
$ nix-build
```

## Usage

There are 3 environment variables that can be set, only the first one is mandatory.

`PROJECT_ID`: Your <a href="#getting-started">Blockfrost.io</a> API token.

`PORT` (optional): default 21000.

`NETWORK` (optional): Accepted values are `mainnet` and `testnet`. Default `mainnet`.

### Production


Mainnet:
```
$ PROJECT_ID='yourBlockfrostTokenForMainnet' yarn start
```

Mainnet custom port:
```
$ PROJECT_ID='yourBlockfrostTokenForMainnet' PORT=21001 yarn start
```

Testnet:
```
$ PROJECT_ID='yourBlockfrostTokenForTestnet' NETWORK=testnet yarn start
```

Testnet custom port:
```
$ PROJECT_ID='yourBlockfrostTokenForTestnet' PORT=21002 NETWORK=testnet yarn start
```

Nix:
Run the binary with appropriate variables.

### Development

Mainnet:
```
$ PROJECT_ID='yourBlockfrostTokenForMainnet' yarn dev
```

Mainnet custom port:
```
$ PROJECT_ID='yourBlockfrostTokenForMainnet' PORT=21001 yarn dev
```

Testnet:
```
$ PROJECT_ID='yourBlockfrostTokenForTestnet' NETWORK=testnet yarn dev
```

Testnet custom port:
```
$ PROJECT_ID='yourBlockfrostTokenForTestnet' PORT=21002 NETWORK=testnet yarn dev
```
