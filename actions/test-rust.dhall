let GithubActions = (./deps.dhall).GithubActions

let RustActions = ./rust-actions.dhall

in  GithubActions.Workflow::{
    , name = "Test Rust"
    , on = GithubActions.On::{ push = Some GithubActions.Push::{=} }
    , jobs = toMap
        { test = GithubActions.Job::{
          , name = Some "Test"
          , runs-on = GithubActions.RunsOn.Type.ubuntu-latest
          , steps =
            [ GithubActions.steps.actions/checkout
            , RustActions.install-toolchain "1.54.0"
            , RustActions.cargo-command "test"
            ]
          }
        }
    }
