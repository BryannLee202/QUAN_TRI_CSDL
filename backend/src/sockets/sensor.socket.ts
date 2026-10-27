export const toReading = (r: Row) => ({
  dataId: Number(r.DataID),
  roomId: r.RoomID as number,
  trayId: (r.TrayID ?? null) as number | null,
  temperature: Number(r.Temperature),
  humidity: Number(r.Humidity),
  co2: Number(r.CO2Level),
  lightLux: r.LightLux == null ? null : Number(r.LightLux),
  recordedAt: new Date(r.RecordedAt).toISOString(),
});

export const toAlert = (r: Row) => ({
  alertId: r.AlertID as number,
  roomId: r.RoomID as number,
  alertType: r.AlertType as string,
  severity: r.Severity as string,
  message: r.Message as string,
  alertTime: new Date(r.AlertTime).toISOString(),
  isResolved: !!r.IsResolved,
});

export const toAction = (r: Row) => ({
  actionId: r.ActionID as number,
  roomId: r.RoomID as number,
  deviceType: r.DeviceType as string,
  actionState: r.ActionState as string,
  triggeredBy: r.TriggeredBy as string,
  details: (r.Details ?? null) as string | null,
  executedAt: new Date(r.ExecutedAt).toISOString(),
});

