const _ = require('lodash');
let a = [{
    "album": {
      "album_type": "album",
      "artists": [
        {
          "external_urls": {
            "spotify": "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
          },
          "href": "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
          "id": "0C0XlULifJtAgn6ZNCW2eu",
          "name": "The Killers",
          "type": "artist",
          "uri": "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
        }
      ],"external_urls": {
        "spotify": "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
      },
      "href": "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
      "id": "4OHNH3sDzIxnmUADXzv2kT",
      "images": [
        {
          "height": 640,
          "url": "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
          "width": 629
        },
        {
          "height": 300,
          "url": "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
          "width": 295
        },
        {
          "height": 64,
          "url": "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
          "width": 63
        }
      ],
      "name": "Hot Fuss",
      "release_date": "2004",
      "release_date_precision": "year",
      "total_tracks": 14,
      "type": "album",
      "uri": "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
    },
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
        },
        "href": "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
        "id": "0C0XlULifJtAgn6ZNCW2eu",
        "name": "The Killers",
        "type": "artist",
        "uri": "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
      }
    ],
    "available_markets": [
      "AD",
      "AE",
      "AR",
      "AT",
      "AU",
      "BE",
      "BG",
      "BH",
      "BO",
      "BR",
      "CH",
      "CL",
      "CO",
      "CR",
      "CY",
      "CZ",
      "DE",
      "DK",
      "DO",
      "DZ",
      "EC",
      "EE",
      "EG",
      "ES",
      "FI",
      "FR",
      "GB",
      "GR",
      "GT",
      "HK",
      "HN",
      "HU",
      "ID",
      "IE",
      "IL",
      "IN",
      "IS",
      "IT",
      "JO",
      "JP",
      "KW",
      "LB",
      "LI",
      "LT",
      "LU",
      "LV",
      "MA",
      "MC",
      "MT",
      "MX",
      "MY",
      "NI",
      "NL",
      "NO",
      "NZ",
      "OM",
      "PA",
      "PE",
      "PH",
      "PL",
      "PS",
      "PT",
      "PY",
      "QA",
      "RO",
      "SA",
      "SE",
      "SG",
      "SK",
      "SV",
      "TH",
      "TN",
      "TR",
      "TW",
      "UY",
      "VN",
      "ZA"
    ],
    "disc_number": 1,
    "duration_ms": 222200,
    "explicit": false,
    "external_ids": {
      "isrc": "GBFFP0300052"
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
    },
    "href": "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
    "id": "3n3Ppam7vgaVa1iaRUc9Lp",
    "is_local": false,
    "name": "Mr. Brightside",
    "popularity": 78,
    "preview_url": "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba?cid=774b29d4f13844c495f206cafdad9c86",
    "track_number": 2,
    "type": "track",
    "uri": "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
  },
  {
    "album": {
      "album_type": "album",
      "artists": [
        {
          "external_urls": {
            "spotify": "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
          },
          "href": "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
          "id": "0C0XlULifJtAgn6ZNCW2eu",
          "name": "The Killers",
          "type": "artist",
          "uri": "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
        }
      ],
      "external_urls": {
        "spotify": "https://open.spotify.com/album/4OHNH3sDzIxnmUADXzv2kT"
      },
      "href": "https://api.spotify.com/v1/albums/4OHNH3sDzIxnmUADXzv2kT",
      "id": "4OHNH3sDzIxnmUADXzv2kT",
      "images": [
        {
          "height": 640,
          "url": "https://i.scdn.co/image/ac68a9e4a867ec3ce8249cd90a2d7c73755fb487",
          "width": 629
        },
        {
          "height": 300,
          "url": "https://i.scdn.co/image/d0186ad64df7d6fc5f65c20c7d16f4279ffeb815",
          "width": 295
        },
        {
          "height": 64,
          "url": "https://i.scdn.co/image/7c3ec33d478f5f517eeb5339c2f75f150e4d601e",
          "width": 63
        }
      ],
      "name": "Hot Fuss",
      "release_date": "2004",
      "release_date_precision": "year",
      "total_tracks": 14,
      "type": "album",
      "uri": "spotify:album:4OHNH3sDzIxnmUADXzv2kT"
    },
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/0C0XlULifJtAgn6ZNCW2eu"
        },
        "href": "https://api.spotify.com/v1/artists/0C0XlULifJtAgn6ZNCW2eu",
        "id": "0C0XlULifJtAgn6ZNCW2eu",
        "name": "The Killers",
        "type": "artist",
        "uri": "spotify:artist:0C0XlULifJtAgn6ZNCW2eu"
      }
    ],
    "disc_number": 1,
    "duration_ms": 222200,
    "explicit": false,
    "external_ids": {
      "isrc": "GBFFP0300052"
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
    },
    "href": "https://api.spotify.com/v1/tracks/3n3Ppam7vgaVa1iaRUc9Lp",
    "id": "3n3Ppam7vgaVa1iaRUc9Lp",
    "is_local": false,
    "name": "Mr. Brightside ASDASDASDASDASD",
    "popularity": 20,
    "preview_url": "https://p.scdn.co/mp3-preview/4839b070015ab7d6de9fec1756e1f3096d908fba?cid=774b29d4f13844c495f206cafdad9c86",
    "track_number": 2,
    "type": "track",
    "uri": "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp"
  }];

  console.log(a);
  console.log(_.reverse(_.sortBy(a, ['popularity'])));