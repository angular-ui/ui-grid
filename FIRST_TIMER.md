This guide aims to be a first principles guide for people who haven't contributed
to open source before, perhaps who have limited javascript or angularJS experience,
or are not familiar with the development toolset that is used for ui-grid.  In short,
it aims to assume you know almost nothing, and provide a set of hints, tips and links
to get you going.

This guide covers a handful of use cases to illustrate the tools, running the tests,
discuss the layout and structure of the code, and describe the process for submitting
a pull request.

1. __A pull request to update documentation.__ This covers forking the repository,
installing the base toolset, updating documentation including ngDoc and tutorials,
running tests and submitting a pull request.

2. __A pull request to fix a code issue.__  This adds on understanding the code base,
writing unit tests and writing e2e tests.

3. __A new feature.__ This covers the structure of a feature and some of the apis
and registration logic.  


## A pull request to update documentation ##

We'll start with the simplest use case - imagine you're a new contributor who knows
almost nothing, and wants to make a documentation change and contribute it as a
pull request.

In order to contribute an update your basic process is:

- Fork the ui-grid repository in github, giving you your own copy in which you 
can work, and over which you have access permissions
- Clone that repository
- Setup the toolset on your local machine
- Make the documentation changes, and verify that they look as you had hoped
- Run the tests to check that nothing has broken
- Commit the code to git, and push the branch to your fork
- Create a pull request from your fork to the upstream repository

We'll go through each step in turn.

### Fork the ui-grid repository ###
This is the easiest step.  Get yourself a github logon, and navigate to the 
[ui-grid github page](https://github.com/angular-ui/ui-grid). Click the
fork button in the top left.  This should navigate you to your list of
projects in github, with a new fork of ui-grid.

You'll see that this gives you your own issue tracker and a bunch of other content.
In general you'll ignore all this, and you'll just use your fork for submitting
pull requests and managing your branches.

### Install the base toolset ###
In order to work with ui-grid you'll need some base tooling.  In particular, you need
git installed for version control and node.js installed to provide the npm toolset.

The installation process is different on each operating system, google is your friend
on this one.

Links to try might include:

- http://nodejs.org/

### Clone the repository to your local machine ###
In your github repository, on the right hand side underneath settings you'll see
a box with "clone url" written in it.  Copy this clone url.

Using the command line (terminal in OSX or linux, cmd in windows) 
go to the directory in which you store your projects.  Type:
`git clone <url you copied>`

__Pro-tip:__  By default github gives you an http clone address, and this will
require you to log on each time you do something.  Look at https://help.github.com/articles/generating-ssh-keys/
for a method to use ssh keys for auto logon, or consider using the github native client.

This should have given you a folder on your machine into which all the ui-grid code
has been copied.  This is also a full git version, so it has all the git commit history
inside it, within the .git folder.

We also want to setup a link to the upstream repository, which we use when fetching
the latest code version:
`  cd ui-grid`
`  git remote add upstream https://github.com/angular-ui/ui-grid.git`

This allows you to get the latest code from upstream by:
`  git fetch upstream` or
`  git pull upstream`
We'll discuss these steps later, for now we just want the setup done.

## Setup the toolset ###
Before we do anything else we'll check that we can compile the code and run all 
the tests - if there are problems here then we want to know it's something wrong
in the install rather than a change that you've made.

In the root folder of the project you'll see two important files:
`  package.json`
`  bower.json`
These configuration files describe the dependencies for building ui-grid.  Package.json
tells the node package manager (npm) what to install, bower.json tells bower what to install.

The installation process is to first install the global packages:
`  npm install -g grunt-cli`
If you're on a unix derived machine (OSX, Linux) you may need elevated privileges to do 
this install:
`  sudo npm install -g grunt-cli`

Then install the npm dependencies:
`  npm install`

Finally install the bower dependencies:
`  bower install`

Next, run the build process to verify that it builds successfully and all the unit tests
pass.  The build process is driven by a tool called grunt - think of this as being similar
to make (for c++), rake (for ruby on rails), ant, cake, or any other build tool.

The core grunt configuration lives in `Gruntfile.js`, in general you shouldn't need to 
change this, but if you get difficulties this is where you'd trouble shoot.

To run a basic build, including unit tests, we can run the grunt default task:
`  grunt`
This will syntax check the code, run the unit tests, extract the documentation using
ngdocs, and put the resulting built version into the `/dist/` folder on your machine.

You should expect to see no errors when running this task - if you get errors then
something has gone wrong.  Tell us about it, and help to improve this guide by adding
common errors and resolutions here:

- So far, no common errors.
 
Next, we want to run the end to end tests.  This may require installing protractor
and selenium.  Start by running the grunt install task:
`  grunt install`
Then, run the end to end tests:
`  grunt test:e2e`
These take a while to run, be patient and make sure they're all fine.

Finally, run the watch task.  This task watches changes you make to the filesystem, and
automatically rebuilds the code.  It runs a development server on port 9003 (you can get
to it on your browser as http://localhost:9003), which is a local copy of the ui-grid.info
site.  This gives you a runnable version of the tutorials and api, and allows you to see
the impact of your code changes on the tutorials.
`  grunt dev`
Check that the tutorials are working fine on your local install.

__Pro-tip:__ Running grunt dev can be slow, as it automatically runs all e2e tests and
unit tests on each change.  You can just skip the testing by running instead `grunt dev --no-e2e`, which
makes it faster, but gives you less information about where you may have broken things.  You
can also use `grunt dev --fast`, which runs only the core unit tests, skips e2e testing, and runs
unit tests against only the most recent angular version (it's an alias for `grunt dev --core --no-e2e --angular=1.3.7`).  
Or you can edit the tests to target only the specific tests for the area you're working on.
Pick the tutorial that has e2e tests and is most relevant to the area you're working in,
and edit the e2e test to have `ddescribe` rather than `describe`.  This will ask jasmine
to run only these tests - making the testing much faster whilst still giving you some coverage.
Similarly with the unit testing pick the unit test specs that relate to the module you're working on
and add `ddescribe` in there.  `iit` has a similar effect.  Remember to take this out
again before submitting a pull request.

### Make documentation changes ###
Before making any changes, create a feature branch.  This means that you branch the code 
base before you commit anything, and this branch is what you'll do a pull request against.
`  git fetch upstream`
`  git checkout upstream/master`
`  git checkout -b <my_branch_name>`
This should give you a clean branch that is based off the latest upstream.

The documentation for ui-grid comes in three components:

1. The .md files within the root directory of the project.  These are visible only
on github, through clicking on them.  They generally deal with information for a contributor,
such as this guide.  These can be edited directly, then submitted.  They are authored in 
markdown format, and can only be viewed in their rendered format on github - so you edit them
then push to your fork, and look at them on github.
2. The tutorial files.  These are in misc/tutorial/*.ngdoc, and are built by the grunt-ngdocs
processor into the dist/docs/partials directory.  You can preview your changes through running
`grunt dev` and looking at http://localhost:9003.  These are again in markdown, but in a special
ngdoc version of markdown.  They can include end-to-end tests, and examples that are exportable
to plunkr.  The biggest gotcha is being careful with where you put the ":" in the name
3. The api documentation.  This is extracted from the comment blocks in the javascript (`src/` folder).  
It uses ngdoc format and is processed by the grunt-ngdocs tool.  Edits to this are done within
the comment blocks in the code.

All of this content can be edited with a text editor.

The ngdoc generator has some tricks and tips.  It is somewhat fussy about integrity - if you declare
a method to be `@methodOf` something, then that something must exist.  If it doesn't then you'll get
an obscure error from grunt-ngdocs.  The best advice is to save often and keep checking that it's 
extracting and rendering properly - then if something gives an error you'll have a good idea of what
you changed.  If you make bulk changes then run grunt-ngdocs, and you get an error, you'll have very 
poor information about where the error is within the documentation set.

### Run the unit and e2e tests ###
As we did initially, run `grunt` to run all the unit tests, and `grunt test:e2e` to run all the end
to end tests.  Verify there are no errors.

### Push and make a pull request ###
First, check that all the changes that you have made are included, and that nothing unexpected is
included:
` git diff`  (if you've not committed yet)
` git diff upstream/master` (if you have some files committed)
Look through the diff listing to verify that only the changes you expected are present.

To commit to git, you can:
`  git add .`
`  git commit`
In your commit message, follow the guidelines from [CONTRIBUTING.md](https://github.com/angular-ui/ui-grid/blob/master/CONTRIBUTING.md):

- Please adhere to these [git commit message guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
  or your code is unlikely be merged into the main project. 
  
If you've made multiple commits to the code, you need to squash them into a single commit so that
we don't end up with lots of small/junk commits in the overall project history.  To do this you
use the interactive rebase function of git:
`  git rebase upstream/master -i`
This is basically asking git to rewrite the commit history for all commits that are different between
your current branch and upstream/master.

Help is available from [interactive rebase](https://help.github.com/articles/interactive-rebase), but
in summary when you request a rebase git will:

1. Display an editor with a list of commits.  You effectively leave the first commit alone, and put
squash in the first word of all the others.  Save that, and git will attempt to squash all the commits
into that first commit
2. Git will then display a second editor for you to edit the commit message.  This is where you want
a nice clean commit message.  If you're fixing an issue, then it should start with `fix #<issue number> (<functional area>)`,
and then it will automatically attach to that issue and close it once merged.  If you're doing documentation
updates you'd often have a commit message that starts with `doco(<functional area>): <short description>

Push your branch up to your fork of the repository.  I usually cheat and rely on git's help messages here:
`  git push`
This will give you an error message, but also tell you what the real instruction is, which you can
copy and paste:
`  git push --set-upstream origin 1023_nulls_to_custom_sort`

Now go to your homepage in git, and to your fork of the ui-grid repository.  You should see a message saying
that a new branch has been pushed, and asking if you want to create a pull request.  Click that button,
and check the list of changes again in the commit history, and that there is a good quality commit
message with only a single commit.

Press the "create pull request" button, and wait for someone to review and approve your pull request.

**IMPORTANT**: By submitting a patch, you agree to allow the project owners to
license your work under the the terms of the [MIT License](LICENSE.md).

Remember that this is a volunteer only open source project.  Most of the developers are working on their
own areas of the functionality, and usually doing that in stolen moments of time.  They generally prefer to
spend time coding their own stuff rather than reviewing the pull requests of others.  Typically it'll take a 
couple of days for someone to find the time to review and comment on your pull request.  Most people will
have a few updates they're requested to make on the first couple, whilst they learn the ropes, so be prepared
for that.


