# Installation

> Install Bun with npm, Homebrew, Docker, or the official script.

## Overview

Bun ships as a single, dependency-free executable. You can install it via script, package manager, or Docker across macOS, Linux, and Windows.

<Tip>After installation, verify with `bun --version` and `bun --revision`.</Tip>

## Installation

<Tabs>
  <Tab title="macOS & Linux">
    <CodeGroup>
      ```bash curl icon="globe" theme={"theme":{"light":"github-light","dark":"dracula"}}
      curl -fsSL https://bun.com/install | bash
      ```
    </CodeGroup>

    <Note>
      **Linux users**  The `unzip` package is required to install Bun. Use `sudo apt install unzip` to install the unzip package. Kernel version 5.6 or higher is strongly recommended, but the minimum is 5.1. Use `uname -r` to check Kernel version.
    </Note>
  </Tab>

  <Tab title="Windows">
    <CodeGroup>
      ```powershell PowerShell icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      powershell -c "irm bun.sh/install.ps1|iex"
      ```
    </CodeGroup>

    <Warning>
      Bun requires Windows 10 version 1809 or later.
    </Warning>

    For support and discussion, please join the **#windows** channel on our [Discord](https://bun.com/discord).
  </Tab>

  <Tab title="Package Managers">
    <CodeGroup>
      ```bash npm icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
      npm install -g bun # the last `npm` command you'll ever need
      ```

      ```bash Homebrew icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/homebrew.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=614be850c39990ccb245ec8f1fe1b1a1" theme={"theme":{"light":"github-light","dark":"dracula"}}
      brew install oven-sh/bun/bun
      ```

      ```bash Scoop icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      scoop install bun
      ```
    </CodeGroup>
  </Tab>

  <Tab title="Docker">
    Bun provides a Docker image that supports both Linux x64 and arm64.

    ```bash Docker icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
    docker pull oven/bun
    docker run --rm --init --ulimit memlock=-1:-1 oven/bun
    ```

    ### Image Variants

    There are also image variants for different operating systems:

    ```bash Docker icon="docker" theme={"theme":{"light":"github-light","dark":"dracula"}}
    docker pull oven/bun:debian
    docker pull oven/bun:slim
    docker pull oven/bun:distroless
    docker pull oven/bun:alpine
    ```
  </Tab>
</Tabs>

To check that Bun was installed successfully, open a new terminal window and run:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun --version
# Output: 1.x.y

# See the precise commit of `oven-sh/bun` that you're using
bun --revision
# Output: 1.x.y+b7982ac13189
```

<Warning>
  If you've installed Bun but are seeing a `command not found` error, you may have to manually add the installation
  directory (`~/.bun/bin`) to your `PATH`.
</Warning>

<Accordion title="Add Bun to your PATH">
  <Tabs>
    <Tab title="macOS & Linux">
      <Steps>
        <Step title="Determine which shell you're using">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          echo $SHELL
          # /bin/zsh  or /bin/bash or /bin/fish
          ```
        </Step>

        <Step title="Open your shell configuration file">
          * For bash: `~/.bashrc`
          * For zsh: `~/.zshrc`
          * For fish: `~/.config/fish/config.fish`
        </Step>

        <Step title="Add the Bun directory to PATH">
          Add this line to your configuration file:

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          export BUN_INSTALL="$HOME/.bun"
          export PATH="$BUN_INSTALL/bin:$PATH"
          ```
        </Step>

        <Step title="Reload your shell configuration">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          source ~/.bashrc  # or ~/.zshrc
          ```
        </Step>
      </Steps>
    </Tab>

    <Tab title="Windows">
      <Steps>
        <Step title="Determine if the bun binary is properly installed">
          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          & "$env:USERPROFILE\.bun\bin\bun" --version
          ```

          If the command runs successfully but `bun --version` is not recognized, it means that bun is not in your system's PATH. To fix this, open a Powershell terminal and run the following command:

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          [System.Environment]::SetEnvironmentVariable(
            "Path",
            [System.Environment]::GetEnvironmentVariable("Path", "User") + ";$env:USERPROFILE\.bun\bin",
            [System.EnvironmentVariableTarget]::User
          )
          ```
        </Step>

        <Step title="Restart your terminal">
          After running the command, restart your terminal and test with `bun --version`

          ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
          bun --version
          ```
        </Step>
      </Steps>
    </Tab>
  </Tabs>
</Accordion>

***

## Upgrading

Once installed, the binary can upgrade itself:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
bun upgrade
```

<Tip>
  **Homebrew users** <br />
  To avoid conflicts with Homebrew, use `brew upgrade bun` instead.

  **Scoop users** <br />
  To avoid conflicts with Scoop, use `scoop update bun` instead.
</Tip>

***

## Canary Builds

[-> View canary build](https://github.com/oven-sh/bun/releases/tag/canary)

Bun automatically releases an (untested) canary build on every commit to main. To upgrade to the latest canary build:

```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
# Upgrade to latest canary
bun upgrade --canary

# Switch back to stable
bun upgrade --stable
```

The canary build is useful for testing new features and bug fixes before they're released in a stable build. To help the Bun team fix bugs faster, canary builds automatically upload crash reports to Bun's team.

***

## Installing Older Versions

Since Bun is a single binary, you can install older versions by re-running the installer script with a specific version.

<Tabs>
  <Tab title="Linux & macOS">
    To install a specific version, pass the git tag to the install script:

    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    curl -fsSL https://bun.com/install | bash -s "bun-v1.3.3"
    ```
  </Tab>

  <Tab title="Windows">
    On Windows, pass the version number to the PowerShell install script:

    ```powershell PowerShell icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
    iex "& {$(irm https://bun.com/install.ps1)} -Version 1.3.3"
    ```
  </Tab>
</Tabs>

***

## Direct Downloads

To download Bun binaries directly, visit the [releases page on GitHub](https://github.com/oven-sh/bun/releases).

### Latest Version Downloads

<CardGroup cols={2}>
  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    Standard Linux x64 binary
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux x64 Baseline" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-baseline.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    For older CPUs without AVX2
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=4588088d53614404d5bbf7ff09e683ed" title="Windows x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64.zip" data-og-width="88" width="88" data-og-height="88" height="88" data-path="icons/windows.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=5d97f6a67886cf0b717207ba92259a46 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=ff8a13db3c0667f8029b30933dad367c 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=25b6bc6bef5ed05b83abaa79122d0af8 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=bb8cdeb3ea1e93c9d16de8027c39704c 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=d06733f6f1ca3f67d30d0f84bfafc13b 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=261ee703aada9c4b60d6525e54193664 2500w">
    Standard Windows binary
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=4588088d53614404d5bbf7ff09e683ed" title="Windows x64 Baseline" href="https://github.com/oven-sh/bun/releases/latest/download/bun-windows-x64-baseline.zip" data-og-width="88" width="88" data-og-height="88" height="88" data-path="icons/windows.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=5d97f6a67886cf0b717207ba92259a46 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=ff8a13db3c0667f8029b30933dad367c 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=25b6bc6bef5ed05b83abaa79122d0af8 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=bb8cdeb3ea1e93c9d16de8027c39704c 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=d06733f6f1ca3f67d30d0f84bfafc13b 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/windows.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=261ee703aada9c4b60d6525e54193664 2500w">
    For older CPUs without AVX2
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=0ac996da7680574a1630b68716af5714" title="macOS ARM64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-aarch64.zip" data-og-width="842" width="842" data-og-height="1000" height="1000" data-path="icons/apple.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=55e8d5c21de2f491eaf39ab693083006 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c5a544fe09d36db1f9d9919e9a825fa6 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e10081f77d9ede8d29b78e13e5b502dc 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=b5f25aa4033416aadc22b0b6f0921027 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=eff94566f2f1854abffe67d4aaac270e 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a6f601367f7ea4198eafcc7f598b00ac 2500w">
    Apple Silicon (M1/M2/M3)
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=0ac996da7680574a1630b68716af5714" title="macOS x64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-x64.zip" data-og-width="842" width="842" data-og-height="1000" height="1000" data-path="icons/apple.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=55e8d5c21de2f491eaf39ab693083006 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=c5a544fe09d36db1f9d9919e9a825fa6 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e10081f77d9ede8d29b78e13e5b502dc 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=b5f25aa4033416aadc22b0b6f0921027 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=eff94566f2f1854abffe67d4aaac270e 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/apple.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a6f601367f7ea4198eafcc7f598b00ac 2500w">
    Intel Macs
  </Card>

  <Card icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=300e7a130d2220736a473333f9679855" title="Linux ARM64" href="https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64.zip" data-og-width="216" width="216" data-og-height="256" height="256" data-path="icons/linux.svg" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=280&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=a1021a1beb4958e46480099f004d26fe 280w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=560&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=69ac5104fde576781616421ac7b3612f 560w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=840&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=28ed8a8da79749aa69ffe58603a9b3fb 840w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1100&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=edb9183e067c05653f419e105eead50e 1100w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=1650&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=e335840244e027300b2607eeec7a665a 1650w, https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/linux.svg?w=2500&fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=35ebcef0ab95791178aa983028bd6622 2500w">
    ARM64 Linux systems
  </Card>
</CardGroup>

### Musl Binaries

For distributions without `glibc` (Alpine Linux, Void Linux):

* [Linux x64 musl](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl.zip)
* [Linux x64 musl baseline](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-musl-baseline.zip)
* [Linux ARM64 musl](https://github.com/oven-sh/bun/releases/latest/download/bun-linux-aarch64-musl.zip)

<Note>
  If you encounter an error like `bun: /lib/x86_64-linux-gnu/libm.so.6: version GLIBC_2.29 not found`, try using the
  musl binary. Bun's install script automatically chooses the correct binary for your system.
</Note>

***

## CPU Requirements

Bun has specific CPU requirements based on the binary you're using:

<Tabs>
  <Tab title="Standard Builds">
    **x64 binaries** target the Haswell CPU architecture (AVX and AVX2 instructions required)

    | Platform | Intel Requirement               | AMD Requirement    |
    | -------- | ------------------------------- | ------------------ |
    | x64      | Haswell (4th gen Core) or newer | Excavator or newer |
  </Tab>

  <Tab title="Baseline Builds">
    **x64-baseline binaries** target the Nehalem architecture for older CPUs

    | Platform     | Intel Requirement               | AMD Requirement    |
    | ------------ | ------------------------------- | ------------------ |
    | x64-baseline | Nehalem (1st gen Core) or newer | Bulldozer or newer |

    <Warning>
      Baseline builds are slower than regular builds. Use them only if you encounter an "Illegal
      Instruction" error.
    </Warning>
  </Tab>
</Tabs>

<Note>
  Bun does not support CPUs older than the baseline target, which mandates the SSE4.2 extension. macOS requires version
  13.0 or later.
</Note>

***

## Uninstall

To remove Bun from your system:

<Tabs>
  <Tab title="macOS & Linux">
    ```bash terminal icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
    rm -rf ~/.bun
    ```
  </Tab>

  <Tab title="Windows">
    ```powershell PowerShell icon="windows" theme={"theme":{"light":"github-light","dark":"dracula"}}
    powershell -c ~\.bun\uninstall.ps1
    ```
  </Tab>

  <Tab title="Package Managers">
    <CodeGroup>
      ```bash npm icon="npm" theme={"theme":{"light":"github-light","dark":"dracula"}}
      npm uninstall -g bun
      ```

      ```bash Homebrew icon="https://mintcdn.com/bun-1dd33a4e/Hq64iapoQXHbYMEN/icons/homebrew.svg?fit=max&auto=format&n=Hq64iapoQXHbYMEN&q=85&s=614be850c39990ccb245ec8f1fe1b1a1" theme={"theme":{"light":"github-light","dark":"dracula"}}
      brew uninstall bun
      ```

      ```bash Scoop icon="terminal" theme={"theme":{"light":"github-light","dark":"dracula"}}
      scoop uninstall bun
      ```
    </CodeGroup>
  </Tab>
</Tabs>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://bun.com/docs/llms.txt