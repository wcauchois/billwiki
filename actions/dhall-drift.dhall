-- https://github.com/dhall-lang/setup-dhall
let GithubActions = (./deps.dhall).GithubActions

in  GithubActions.Workflow::{
    , name = "Check Dhall Drift"
    , on = GithubActions.On::{ push = Some GithubActions.Push::{=} }
    , jobs = toMap
        { check-drift = GithubActions.Job::{
          , name = Some "Check Drift"
          , runs-on = GithubActions.RunsOn.Type.ubuntu-latest
          , steps =
            [ GithubActions.steps.actions/checkout
            , GithubActions.Step::{
              , uses = Some "dhall-lang/setup-dhall@v4.2.0"
              , `with` = Some
                  ( toMap
                      { version = "1.28.0"
                      , github_token = "\${{ github.token }}"
                      }
                  )
              }
            , GithubActions.Step::{
              , name = Some "Make Dhall"
              , run = Some "make clean && make"
              }
            , GithubActions.Step::{
              , name = Some "Check for any changes"
              -- Test for changes in working dir: https://stackoverflow.com/a/5737794
              , run = Some
                  ''
                    test -n "$(git status --porcelain)"
                  ''
              }
            ]
          }
        }
    }
