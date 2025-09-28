# Viewport Extra Demo Images

Generate and publish demo images for the [Viewport Extra](https://github.com/dsktschy/viewport-extra) documentation.

## Usage

### Generate images

Triggering the [Create release pull request workflow](https://github.com/dsktschy/viewport-extra-demo-images/actions/workflows/create-release-pull-request.yml) will comment the download URL for the generated images on the created pull request.

### Publish images

Merging the release pull request will push the generated images to the [artifacts branch](https://github.com/dsktschy/viewport-extra-demo-images/tree/artifacts) and publish them on the raw.githubusercontent.com domain.
