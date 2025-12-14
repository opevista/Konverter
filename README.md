# Konverter

Konverter is an Electron-based desktop application designed for media file conversion.

## Features

-   Convert various media file formats.
-   User-friendly interface.

## Installation

To install Konverter, download the latest `.dmg` (for macOS) or `.zip` (for macOS) release from the [releases page](https://github.com/opevista/Konverter/releases).

## Building from Source

To build Konverter from source, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/opevista/Konverter.git
    cd Konverter
    ```

2.  **Navigate to the electron directory:**
    ```bash
    cd electron
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Package the application:**
    ```bash
    npm run package
    ```
    This will generate the `.dmg` and `.zip` files in the `Package` directory.

## Recommended Application for Media Files (macOS)

Konverter is configured to appear as an "Alternate" recommended application for various media file types on macOS. This means you can right-click on a media file, select "Open With," and find Konverter in the list.

The `Info.plist` modification for this is automatically applied during the `npm run package` process via a `postpackage` script in `electron/package.json`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.