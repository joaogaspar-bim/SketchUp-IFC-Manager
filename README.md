# SketchUp-IFC-Manager
## IFC data manager and exporter for SketchUp.
SketchUp-IFC-Manager is an extension that helps you to add more useful information to IFC models created with SketchUp.. It’s created around the dutch “BIM basis ILS” (English: [BIM basic IDM](http://www.bimloket.nl/upload/documents/downloads/BIMbasisILS/BIM%20basic%20IDM%20(A4).pdf)) initiative that tries to achieve a basic Information delivery specification for the dutch building industry (http://www.bimloket.nl/BIMbasisILS)

## About this fork

This repository is a fork of [BIM-Tools/SketchUp-IFC-Manager](https://github.com/BIM-Tools/SketchUp-IFC-Manager), maintained independently by [joaogaspar-bim](https://github.com/joaogaspar-bim). It is distributed under the same license as the original project — see [License](#license) below.

Changes made in this fork relative to upstream `main` (as of the `5.5.4-jgb.1` release), based on the `feature/dynamic-classification-systems` branch:

- Discover classification systems dynamically from the active model, instead of a fixed list.
- Let users choose which property-set groups export per classification.
- Scope 'other' classifications to the active document, instead of `settings.yml`.
- Fix invalid IFC output: empty property-set groups no longer write a boolean.
- Fix IFC entity class generation checking the wrong Ruby namespace.
- Fix a missing `require` in `IfcTypeProduct_su`, exposed by the previous fix.

This extension registers in SketchUp as **"IFC Manager (fork jgb)"**, with its own version scheme (`<upstream base version>-jgb.<fork build number>`), so it can be installed side by side with the original "IFC Manager" extension without conflict.

For upstream documentation, issue tracking, and the canonical version of the project, see [BIM-Tools/SketchUp-IFC-Manager](https://github.com/BIM-Tools/SketchUp-IFC-Manager). This fork is not affiliated with or endorsed by BIM-Tools.

## License

SketchUp-IFC-Manager, including this fork, is licensed under the [GNU General Public License v3.0](LICENSE) (or, per the original file headers, GPL v2 or later). This means you are free to use, study, modify and redistribute this software, including modified versions, as long as:

- Any distributed version (including forks) remains licensed under the GPL.
- The source code is made available alongside any distributed binary/package.
- Changes made to the code are documented (see "About this fork" above).
- Original copyright notices are preserved in the source files.

Original copyright: 2017 Jan Brouwer \<jan@brewsky.nl\> and contributors. Modifications in this fork: Copyright 2026 João Gaspar (joaogaspar-bim).

## Documentation
- [Installation](https://github.com/BIM-Tools/SketchUp-IFC-Manager/wiki/Installation)
- [Usage](https://github.com/BIM-Tools/SketchUp-IFC-Manager/wiki)
  - [Paint properties](https://github.com/BIM-Tools/SketchUp-IFC-Manager/wiki/Paint-properties-tool)
  - [Settings](https://github.com/BIM-Tools/SketchUp-IFC-Manager/wiki/Settings)
- Read the PDF documentation [Dutch: Basis ILS for SketchUp](https://github.com/BIM-Tools/SketchUp-IFC-Manager/blob/master/SketchUp_BIM%20basis%20ILS%202.0-handleiding_ppt.pdf) or [English: BIM basic IDM](/ILS_Native_SketchUp_v2.1%20ENG.PDF)
- Watch the [video tutorial of the IFC manager plugin](https://vimeo.com/256742066)
- Watch the [video tutorial of the paint properties tool](https://vimeo.com/256742112)

## Rubyzip
IFC Manager includes a (minimally modified) [copy](https://github.com/janbrouwer/rubyzip) of rubyzip which is licensed under the [Ruby license](http://www.ruby-lang.org/en/LICENSE.txt). Many thanks to the people at the Rubyzip project: [Robert Haines, John Lees-Miller, Oleksandr Simonov, Thomas Sondergaard](https://github.com/rubyzip/rubyzip).
