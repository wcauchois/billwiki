let GithubActions = (./deps.dhall).GithubActions

in  { install-toolchain =
        \(version : Text) ->
          GithubActions.Step::{
          , name = Some "Install stable toolchain"
          , uses = Some "actions-rs/toolchain@v1"
          , `with` = Some
              ( toMap
                  { profile = "minimal"
                  , toolchain = version
                  , override = "true"
                  }
              )
          }
    , cargo-command =
        \(command : Text) ->
          GithubActions.Step::{
          , name = Some "Run cargo ${command}"
          , uses = Some "actions-rs/cargo@v1"
          , `with` = Some (toMap { command })
          }
    }
