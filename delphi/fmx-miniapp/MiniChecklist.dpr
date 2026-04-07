program MiniChecklist;

uses
  System.SysUtils,
  FMX.Forms,
  MainForm in 'MainForm.pas';

begin
  Application.Initialize;
  Application.CreateForm(TMainForm, MainForm);
  Application.Run;
end.
