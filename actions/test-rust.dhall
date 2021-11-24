let GithubActions =
      https://raw.githubusercontent.com/regadas/github-actions-dhall/master/package.dhall

let echo =
      GithubActions.steps.echo
        { name = "Echo the greeting's time"
        , what = "'The time was \${{ steps.hello.outputs.time }}.'"
        }

in  GithubActions.Workflow::{
    , name = "Greeting"
    , on = GithubActions.On::{ push = Some GithubActions.Push::{=} }
    , jobs = toMap
        { build = GithubActions.Job::{
          , name = Some "Greeting"
          , runs-on = GithubActions.RunsOn.Type.ubuntu-latest
          , steps = [ echo ]
          }
        }
    }
