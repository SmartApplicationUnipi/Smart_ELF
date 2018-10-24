//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class IAnalogSensor : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal IAnalogSensor(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(IAnalogSensor obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~IAnalogSensor() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_IAnalogSensor(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public new int read(Vector arg0) {
    int ret = yarpPINVOKE.IAnalogSensor_read(swigCPtr, Vector.getCPtr(arg0));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public virtual int getState(int ch) {
    int ret = yarpPINVOKE.IAnalogSensor_getState(swigCPtr, ch);
    return ret;
  }

  public virtual int getChannels() {
    int ret = yarpPINVOKE.IAnalogSensor_getChannels(swigCPtr);
    return ret;
  }

  public virtual int calibrateSensor() {
    int ret = yarpPINVOKE.IAnalogSensor_calibrateSensor__SWIG_0(swigCPtr);
    return ret;
  }

  public virtual int calibrateSensor(Vector value) {
    int ret = yarpPINVOKE.IAnalogSensor_calibrateSensor__SWIG_1(swigCPtr, Vector.getCPtr(value));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public virtual int calibrateChannel(int ch) {
    int ret = yarpPINVOKE.IAnalogSensor_calibrateChannel__SWIG_0(swigCPtr, ch);
    return ret;
  }

  public virtual int calibrateChannel(int ch, double value) {
    int ret = yarpPINVOKE.IAnalogSensor_calibrateChannel__SWIG_1(swigCPtr, ch, value);
    return ret;
  }

  public static readonly int AS_OK = yarpPINVOKE.IAnalogSensor_AS_OK_get();
  public static readonly int AS_ERROR = yarpPINVOKE.IAnalogSensor_AS_ERROR_get();
  public static readonly int AS_OVF = yarpPINVOKE.IAnalogSensor_AS_OVF_get();
  public static readonly int AS_TIMEOUT = yarpPINVOKE.IAnalogSensor_AS_TIMEOUT_get();

}
