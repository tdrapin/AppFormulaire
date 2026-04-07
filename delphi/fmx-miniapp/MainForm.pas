unit MainForm;

interface

uses
  System.SysUtils,
  System.Classes,
  System.IOUtils,
  System.JSON,
  System.Generics.Collections,
  FMX.Types,
  FMX.Controls,
  FMX.Forms,
  FMX.StdCtrls,
  FMX.Layouts,
  FMX.ScrollBox,
  FMX.Memo;

type
  TMainForm = class(TForm)
  private
    FHeader: TToolBar;
    FTitle: TLabel;
    FSaveButton: TButton;
    FReloadButton: TButton;
    FScroll: TVertScrollBox;

    function GetDataFilePath: string;
    procedure BuildUI;
    procedure BuildChecklist;
    procedure LoadState;
    procedure SaveState;

    procedure OnSaveClick(Sender: TObject);
    procedure OnReloadClick(Sender: TObject);
  public
    constructor Create(AOwner: TComponent); override;
  end;

var
  MainForm: TMainForm;

implementation

type
  TChecklistItemDef = record
    Id: string;
    LabelText: string;
  end;

const
  ChecklistItems: array[0..5] of TChecklistItemDef = (
    (Id: 'wheels'; LabelText: 'Roues / pneus OK'),
    (Id: 'lights'; LabelText: 'Feux OK'),
    (Id: 'oil'; LabelText: 'Niveau d''huile OK'),
    (Id: 'coolant'; LabelText: 'Liquide de refroidissement OK'),
    (Id: 'papers'; LabelText: 'Papiers / documents présents'),
    (Id: 'notes'; LabelText: 'Remarques traitées')
  );

{ TMainForm }

constructor TMainForm.Create(AOwner: TComponent);
begin
  inherited Create(AOwner);
  Caption := 'FMX Checklist (mini)';
  Width := 420;
  Height := 720;

  BuildUI;
  BuildChecklist;
  LoadState;
end;

procedure TMainForm.BuildUI;
begin
  FHeader := TToolBar.Create(Self);
  FHeader.Parent := Self;
  FHeader.Align := TAlignLayout.Top;
  FHeader.Height := 48;

  FTitle := TLabel.Create(Self);
  FTitle.Parent := FHeader;
  FTitle.Align := TAlignLayout.Left;
  FTitle.Margins.Left := 12;
  FTitle.Text := 'Checklist';
  FTitle.Font.Size := 16;

  FSaveButton := TButton.Create(Self);
  FSaveButton.Parent := FHeader;
  FSaveButton.Align := TAlignLayout.Right;
  FSaveButton.Text := 'Sauver';
  FSaveButton.Width := 100;
  FSaveButton.OnClick := OnSaveClick;

  FReloadButton := TButton.Create(Self);
  FReloadButton.Parent := FHeader;
  FReloadButton.Align := TAlignLayout.Right;
  FReloadButton.Text := 'Recharger';
  FReloadButton.Width := 110;
  FReloadButton.OnClick := OnReloadClick;

  FScroll := TVertScrollBox.Create(Self);
  FScroll.Parent := Self;
  FScroll.Align := TAlignLayout.Client;
  FScroll.Padding.Top := 12;
  FScroll.Padding.Left := 12;
  FScroll.Padding.Right := 12;
  FScroll.Padding.Bottom := 12;
end;

procedure TMainForm.BuildChecklist;
var
  i: Integer;
  chk: TCheckBox;
begin
  FScroll.BeginUpdate;
  try
    FScroll.Content.DeleteChildren;

    for i := Low(ChecklistItems) to High(ChecklistItems) do
    begin
      chk := TCheckBox.Create(Self);
      chk.Parent := FScroll;
      chk.Align := TAlignLayout.Top;
      chk.Height := 44;
      chk.Margins.Bottom := 8;
      chk.Text := ChecklistItems[i].LabelText;
      chk.TagString := ChecklistItems[i].Id;
      chk.IsChecked := False;
    end;
  finally
    FScroll.EndUpdate;
  end;
end;

function TMainForm.GetDataFilePath: string;
var
  baseDir: string;
begin
  baseDir := TPath.Combine(TPath.GetDocumentsPath, 'XtralogFmxMiniapp');
  TDirectory.CreateDirectory(baseDir);
  Result := TPath.Combine(baseDir, 'checklist.json');
end;

procedure TMainForm.LoadState;
var
  filePath: string;
  jsonText: string;
  jsonValue: TJSONValue;
  jsonArray: TJSONArray;
  dict: TDictionary<string, Boolean>;
  i: Integer;
  obj: TJSONObject;
  id: string;
  isChecked: Boolean;
  c: TFmxObject;
  chk: TCheckBox;
begin
  filePath := GetDataFilePath;
  if not TFile.Exists(filePath) then
    Exit;

  jsonText := TFile.ReadAllText(filePath, TEncoding.UTF8);
  jsonValue := TJSONObject.ParseJSONValue(jsonText);
  if jsonValue = nil then
    Exit;

  dict := TDictionary<string, Boolean>.Create;
  try
    try
      jsonArray := jsonValue as TJSONArray;
    except
      Exit;
    end;

    for i := 0 to jsonArray.Count - 1 do
    begin
      if not (jsonArray.Items[i] is TJSONObject) then
        Continue;

      obj := TJSONObject(jsonArray.Items[i]);
      id := obj.GetValue<string>('id', '');
      isChecked := obj.GetValue<Boolean>('checked', False);
      if id <> '' then
        dict.AddOrSetValue(id, isChecked);
    end;

    for c in FScroll.Content.Children do
    begin
      if c is TCheckBox then
      begin
        chk := TCheckBox(c);
        if dict.TryGetValue(chk.TagString, isChecked) then
          chk.IsChecked := isChecked;
      end;
    end;
  finally
    dict.Free;
    jsonValue.Free;
  end;
end;

procedure TMainForm.SaveState;
var
  jsonArray: TJSONArray;
  filePath: string;
  c: TFmxObject;
  chk: TCheckBox;
  obj: TJSONObject;
  jsonText: string;
begin
  jsonArray := TJSONArray.Create;
  try
    for c in FScroll.Content.Children do
    begin
      if c is TCheckBox then
      begin
        chk := TCheckBox(c);
        obj := TJSONObject.Create;
        obj.AddPair('id', chk.TagString);
        obj.AddPair('label', chk.Text);
        obj.AddPair('checked', TJSONBool.Create(chk.IsChecked));
        jsonArray.AddElement(obj);
      end;
    end;

    jsonText := jsonArray.ToJSON;
    filePath := GetDataFilePath;
    TFile.WriteAllText(filePath, jsonText, TEncoding.UTF8);
  finally
    jsonArray.Free;
  end;
end;

procedure TMainForm.OnReloadClick(Sender: TObject);
begin
  LoadState;
end;

procedure TMainForm.OnSaveClick(Sender: TObject);
begin
  SaveState;
end;

end.
