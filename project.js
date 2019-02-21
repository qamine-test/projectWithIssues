/* global QamineUtils, Stripe */

"use strict";

(function($, window) {
  var classVar = (function() {

    var utils = QamineUtils.getInstance();

    function ProjectSettings() {
    }

    ProjectSettings.prototype.bindLanguageExtension = function(projectId, url) {
      $(".jsSaveExtensions").click(function() {

        var langExtensions = function(language, extensions) {
          return {
            "language": language,
            "extensions": extensions
          }
        };

        var arr = $.map($('.fileLanguageExtension'), function(obj, i) {
          var languageName = $(obj).data('language-name');
          var extensions = $(obj).val().split(',');

          return langExtensions(languageName.toLowerCase(), extensions);
        });

        var postData = {};
        postData.projectId = projectId;
        postData.languageExtensions = JSON.stringify(arr);

        utils.post(url, postData, function(e) {
          if (e.error) {
            $(".jsLanguageExtensionFeedback").showError(e.error);
          } else {
            $(".jsLanguageExtensionFeedback").showSuccess("Saved");
            ProjectSettings.prototype.changesFooter("#changesFooter-extensions");
          }
        }, function() {
          $(".jsLanguageExtensionFeedback").showError("Could not save your settings please try again.");
        });
      });

    };

    ProjectSettings.prototype.bindGenerateKey = function() {
      $(".btnGenerateKey").click(function() {
        $(this).addClass('disabled');
        var url = $(this).data("url");
        utils.post(url, null, function(e) {
          if (e.error) {
            $(".GenerateKeyFeedback").showError(e.error);
          } else {
            location.reload();
          }
        }, function() {
          $(".GenerateKeyFeedback").showError("Could not generate key, please try again.");
        });
      });
    };

    ProjectSettings.prototype.bindGenerateUserKey = function() {
      $(".btnGenerateUserKey").click(function() {
        $(this).addClass('disabled');
        var url = $(this).data("url");
        utils.post(url, null, function(e) {
          if (e.error) {
            $(".GenerateUserKeyFeedback").showError(e.error);
          } else {
            location.reload();
          }
        }, function() {
          $(".GenerateUserKeyFeedback").showError("Could not add key to user, please try again.");
        });
      });
    };

    ProjectSettings.prototype.bindRemoveProject = function() {
      $(".btnRemoveProject").click(function() {
        var $this = $(this);
        var removeUrl = $this.data("url");
        var redirectUrl = $this.data("iden");


        utils.post(removeUrl, {}, function(e) {
          if (e.error) {
            $(".RemoveProjectFeedback").showError(e.error);
          } else {
            window.location.href = redirectUrl;
          }
        }, function() {
          $(".RemoveProjectFeedback").showError("Could not remove project, please try again.");
        });
      });
    };

    ProjectSettings.prototype.bindTransferProject = function() {

      var $orgBox = $("select.js-project-destination");
      var $teamBox = $("select.js-organization-teams-selection-box");

      $(".btnTransferProject").click(function() {
        var $this = $(this);

        var payload = {};

        payload.orgId = $orgBox.val();

        var teamIds = $teamBox.val();

        if (teamIds) {
          payload.teamIds = teamIds;
          var url = $this.data("url");
          utils.JSend(url, payload, function() {
              $(".TransferProjectFeedback").showSuccess("Project transferred successfully!");
              window.location = $this.data("reload");
            }, function(error) {
              $(".TransferProjectFeedback").showError(error);
            },
            "Could not transfer project, please try again.");
        }
      });

      //Reflects the teams that are shown on the team selection box
      var teamBoxData = [];

      //Bindings on each item on the organization selection box
      $orgBox.on("rendered.bs.select",function() {
        var teamsUrl = $orgBox.find("option:selected").data("url");
        $teamBox.prop("disabled", true).selectpicker("refresh");
        utils.request(teamsUrl, successFallback, failureFallback, function() {
          $teamBox.selectpicker("refresh");
          utils.selectpickerAddIdtoList($teamBox, "qa-teams");
        });
        utils.selectpickerAddIdtoList($orgBox, "qa-organization");
      });

      $("#transferBtn").click(function() {
        //Update transfer project confirmation modal text
        var confirmationBox = $(".modal-transfer-project .modal-body");
        var projectName = confirmationBox.data("projectname");

        var selectedTeams = [];
        $teamBox.find("option:selected").each(function(i, e) {
          selectedTeams.push($(e).text());
        });
        if (selectedTeams.length > 0) {
          $(".btnTransferProject").show();
          var baseMsg = "Are you sure that you want to transfer <strong>" + projectName + "</strong>";
          var orgName = "<strong>" + $orgBox.find("option:selected").text() + "</strong>";
          var teamNames = "";
          for (var i = 0; i < selectedTeams.length; i++) {
            teamNames += " <strong>" + selectedTeams[i] + "</strong>";
          }

          if (teamNames !== "") {
            teamNames = " - " + teamNames
          }

          confirmationBox.find("p").html(baseMsg + " to " + orgName + teamNames + "?");
        } else {
          $(".btnTransferProject").hide();
          confirmationBox.find("p").html("You need to choose at least one team.");
        }


      });

      var successFallback = function(jsResponse) {
        teamBoxData = [];
        jsResponse.data.forEach(function(element) {
          var option = "<option value='"+ element.id +"'>" + element.text + "</option>";
          teamBoxData.push(option);
        });
        //teams is a array of {id, text} with the id and name of the team
        $teamBox.html(teamBoxData);
        if(jsResponse.data.length > 1) {
          $teamBox.prop("multiple", true);
          $teamBox.selectpicker("destroy");
          $teamBox.selectpicker({
            iconBase: 'fa',
            tickIcon: 'fa-check'
          });
        } else {
          $teamBox.prop("multiple", false);
          $teamBox.selectpicker("destroy");
          $teamBox.selectpicker();
        }

        $teamBox.prop("disabled", false);
      };

      var failureFallback = function() {
        teamBoxData = [];
      };

      //Gets the teams for the selected organization
      $orgBox.selectpicker("refresh");
    };

    ProjectSettings.prototype.bindUpdateProjectName = function(projectId) {
      $(".BtnUpdateProjectName").click(function() {
        var url = $(this).data("url");
        var postVariable = {};
        postVariable.projectName = $(".TxtUpdateProjectName").val();
        postVariable.projectId = projectId.toString();

        utils.JSend(url, postVariable, function(data) {
          $(".ProjectNameFeedback").showSuccess("Saved");
          location.reload();
        }, function(error) {
          $(".ProjectNameFeedback").showError(error);
        });
      });

      $(".TxtUpdateProjectName").keyup(function() {
        $(".BtnUpdateProjectName").removeClass("disabled");
      });
    };

    ProjectSettings.prototype.bindUpdateProjectUrl = function(projectId) {
      $(".BtnUpdateProjectUrl").click(function() {
        var projectUrlFeedback = $(".ProjectUrlFeedback");
        var url = $(this).data("url");

        var projectUrl = $(".TxtUpdateProjectUrl").val();
        var isPrivate = $(this).data("is-private");
        if (!UrlUtils.getInstance().isValidUrl(projectUrl, isPrivate)) {
          projectUrlFeedback.showError("The url is invalid");
          return false;
        }

        var postVariable = {};
        postVariable.projectUrl = projectUrl;
        postVariable.projectId = projectId.toString();

        utils.post(url, postVariable, function(e) {
          if (e.error) {
            projectUrlFeedback.showError(e.error);
          } else {
            projectUrlFeedback.showSuccess("Saved");
            location.reload();
          }
        }, function() {
          projectUrlFeedback.showError("Could not change the url, please try again.");
        });
      });

      $(".TxtUpdateProjectUrl").keyup(function() {
        $(".BtnUpdateProjectUrl").removeClass("disabled");
      });
    };

    ProjectSettings.prototype.createFileTree = function(jsonData) {
      var glyph_opts = {
        map: {
          checkbox: "fa fa-square-o",
          checkboxSelected: "fa fa-check",
          checkboxUnknown: "fa fa-minus-square",
          dragHelper: "fa fa-arrow-right",
          dropMarker: "fa fa-long-arrow-right",
          error: "fa fa-warning",
          expanderClosed: "fa fa-caret-right",
          expanderLazy: "fa fa-angle-right",
          expanderOpen: "fa fa-caret-down",
          nodata: "fa fa-meh-o",
          loading: "fa fa-spinner fa-pulse",
          // Default node icons.
          // (Use tree.options.icon callback to define custom icons based on node data)
          doc: "fa fa-file-o",
          docOpen: "fa fa-file-o",
          folder: "fa fa-folder",
          folderOpen: "fa fa-folder-open"
        }
      };
      $(".file-tree").fancytree({
        checkbox: true,
        extensions: ["edit", "glyph"],
        glyph: glyph_opts,
        selectMode: 3,
        clickFolderMode: 4,
        source: jsonData
      });
    };

    ProjectSettings.prototype.bindIgnoreFiles = function(projectId) {
      $(".BtnSaveIgnoredFiles").click(function() {
        var i, j, chunk = 500;

        var selected = [];
        $.each($(".file-tree").fancytree("getTree").getSelectedNodes(true), function(i, node) {
          selected.push(node.key);
        });

        var unignoreUrl = $(this).data("reset");
        var postUnignore = {};
        postUnignore.projectId = projectId;
        postUnignore.files = [];

        var ignoreUrl = $(this).data("ignore");
        var postIgnore = {};
        postIgnore.projectId = projectId;
        var hasError = false;

        utils.post(unignoreUrl, postUnignore, function() {

          //prepare post cycle, we only want to show feedback on the last iteration
          var checkError = function(e) {
            if (e.error) {
              hasError = true;
            }
          };

          var onPostError = function() {
            hasError = true;
          };

          var onLastIterationSuccess = function(e) {
            if (e.error) {
              $(".IgnoreFilesFeedback").showError(e.error);
            } else {
              $(".IgnoreFilesFeedback").showSuccess("Saved");
              ProjectSettings.prototype.changesFooter(".welcome__alert");
            }
          };
          var onLastIterationError = function(e) {
            $(".IgnoreFilesFeedback").showError(e.error);
          };

          for (i = 0, j = selected.length; i < j; i += chunk) {

            postIgnore.files = selected.slice(i, i + chunk);
            var lastIteration = i + chunk > selected.length;

            if (!lastIteration) {
              utils.post(ignoreUrl, postIgnore, checkError, onPostError);
            }
            else {
              utils.post(ignoreUrl, postIgnore, onLastIterationSuccess, onLastIterationError);
            }

          }
        });
      });
    };

    ProjectSettings.prototype.bindPublicProject = function() {

      var modalProject = $("#visibilityProjectModal");

      var bindPublicOrPrivate = function() {
        var $btn = $("#ChangeProjectVisibility");
        var feedback = $(".ProjectFeedback");

        var postVariable = {};
        postVariable.projectId = $btn.data("projectid");
        postVariable.setAsPublic = $btn.data("ispublic");

        var url = $btn.data("url");
        utils.post(url, postVariable, function(e) {
          if (e.error) {
            modalProject.modal("hide");
            feedback.showError("Failed to change project visibility.");
          } else {
            window.location.reload();
          }
        }, function() {
          modalProject.modal("hide");
          feedback.showError("Failed to change project visibility.");
        });
      };

      $(".change-visibility").click(function(e) {
        e.preventDefault();
        bindPublicOrPrivate();
      });

    };

    ProjectSettings.prototype.changesFooter = function(footer) {
      $(footer).fadeIn("fast");
    };

    ProjectSettings.prototype.bindProjectAnalysis = function() {
      $(".js_project_remote_analysis").on('click', function() {
        var $this = $(this);
        var url = $this.data('url');
        var payload = {};
        payload[$this.attr('name')] = $this.prop('checked');
        utils.JSend(url, payload,
          $.noop, $.noop);
      });
    };

    ProjectSettings.prototype.bindBadge = function() {
      $(".js-add-badge").click(function() {
        var btn = $(this);
        const url = btn.data('url');
        btn.addClass("disabled"); // disable button after click because answer may take a while
        utils.JSend(url, {}, function(data) {
          if (data) {
            $('.BadgeFeedback').showSuccess("Badge created");
          } else {
            $('.BadgeFeedback').addError("Can't create badge for this project");
          }
        }, function(err) {
          $('.BadgeFeedback').addError(err);
          btn.removeClass("disabled"); // allow to click again
        }, "Could not create badge, try again")
      });

      $(".badge-format").click(function(e) {
        e.preventDefault();
        $("#badge").val($(this).data("value"));
      });

      $(".badge-format-coverage").click(function(e) {
        e.preventDefault();
        $("#badgeCoverage").val($(this).data("value"));
      });
    };



    ProjectSettings.prototype.bindPrReviewTimeDropdown = function(projectId) {
      $(".BtnUpdateTimeToReviewPR").click(function() {
        var timeToReviewPR = $(".TxtUpdateTimeToReviewPR").val();
        var url = $(this).data("url").replace(-1, timeToReviewPR);
        var postVariable = {};

        utils.post(url, postVariable, function(e) {
          if (e.error) {
            $(".TimeToReviewPRFeedback").showError(e.error);
          } else {
            $(".TimeToReviewPRFeedback").showSuccess("Saved");
            location.reload();
          }
        }, function() {
          $(".TimeToReviewPRFeedback").showError("Could not save name, please try again.");
        });
      });

      $(".TxtUpdateTimeToReviewPR").keyup(function() {
        $(".BtnUpdateTimeToReviewPR").removeClass("disabled");
      });
    };

    var setPushHook = function(isIntegrationActive, isHookActive, activateUrl, deactivateUrl) {
      if (isIntegrationActive) {
        $("#hookToggle").show();
        $("#integrationNotEnabled").hide();
        $(".hook-setup-automatic").show();
        $("#hook-collapse").collapse('hide');
        $('#hookFeedback').hide();
        $("#hookToggle").click(function() {
          var $this = $(this);
          var url = '';
          if (isHookActive) {
            url = deactivateUrl;
          } else {
            url = activateUrl;
          }
          utils.JSend(url, {}, function() {
            setPushHook(isIntegrationActive, !isHookActive, activateUrl, deactivateUrl);
            var indicator = $this.closest(".notification-item").find(".notification-indicator");
            indicator.removeClass("circle-red").addClass("circle-green");
          }, function() {
            $this.prop("checked", false);
            if (url === activateUrl) {
              $('#hookFeedback').show();
              $("#hook-collapse").collapse('show');
            } else {
              $('#hookFeedbackOnRemove').show();
            }
          });
        });
      } else {
        $('#hookFeedback').hide();
        $("#hookToggle").hide();
        $("#integrationNotEnabled").show();
        $(".hook-setup-automatic").hide();
        $("#hook-collapse").collapse('show');
      }
    };

    ProjectSettings.prototype.bindPushHook = function(isIntegrationActive, isHookActive, activateUrl, deactivateUrl) {
      setPushHook(isIntegrationActive, isHookActive, activateUrl, deactivateUrl);
    };

    ProjectSettings.prototype.bindOutsideCollaborators = function() {
      $(".js-content-edit").click(function(e) {
        e.preventDefault();
        $(".co__popover").toggle();
      });

      var $inputEmail = $("#js-add-outside-collaborator-email");
      var $addCollaborator = $(".js-add-outside-collaborator");

      $inputEmail.keyup(function(e) {
        $(this).parent().removeClass("has-error");

        if (e.keyCode == 13) {
          $addCollaborator.click();
        }
      });

      $addCollaborator.click(function(e) {
        e.preventDefault();
        var $this = $(this);
        var $feedback = $inputEmail.siblings("p");
        var url = $this.data("url");
        var email = $inputEmail.val();

        $this.prop("disabled", true);
        $inputEmail.prop("disabled", true);

        utils.JSend(url, {"email": email},
          function() {
            location.reload();
          }, function(error) {
            $this.prop("disabled", false);
            $inputEmail.prop("disabled", false);
            $inputEmail.parent().addClass("has-error");
            $feedback.text(error);
          });
      });

      $(".js-remove-outside-collaborator").click(function(e) {
        e.preventDefault();
        var $this = $(this);
        var url = $this.data("url");
        utils.JSend(url, {}, function() {
          $this.closest("tr").find(".js-outside-collaborator").slideUp(function() {
            $this.closest("tr").remove();
          });
        });
      });
    };

    var instance;
    return {
      getInstance: function() {
        if (instance === undefined) {
          instance = new ProjectSettings();
          // Hide the constructor so the returned objected can't be new'd...
          instance.constructor = null;
        }
        return instance;
      }
    };
  })();

  window.ProjectSettings = classVar;
  return window.ProjectSettings;

})(jQuery, window);
