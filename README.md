## TODO:

- use some more reliable way of finding what games are live. NBA API or something?
- looks like BestSolaris has [some sort of API](https://bestsolaris.com/wp-json/wp/v2/posts/45214). Use?
  - `curl "https://bestsolaris.com/wp-json/wp/v2/posts?per_page=20&after=2023-11-01+18:00:00" | jq '.[] | {"title": .title.rendered, "published": .date, "id": .id}'` yupppp
  - page=n and per_page=100 are my friends. Also after parameter is quite nice
