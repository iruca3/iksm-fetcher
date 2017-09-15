export npm_config_target=1.7.6
export npm_config_arch=x64
export npm_config_target_arch=x64
export npm_config_disturl=https://atom.io/download/electron
export npm_config_runtime=electron
export npm_config_build_from_source=true
HOME=~/.electron-gyp npm install

electron-packager . iksm-fetcher --platform=darwin,win32 --arch=x64 --electron-version=1.7.6 --overwrite
