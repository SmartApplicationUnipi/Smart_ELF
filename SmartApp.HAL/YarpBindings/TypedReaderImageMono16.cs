//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class TypedReaderImageMono16 : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal TypedReaderImageMono16(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(TypedReaderImageMono16 obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~TypedReaderImageMono16() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_TypedReaderImageMono16(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public new void setStrict(bool strict) {
    yarpPINVOKE.TypedReaderImageMono16_setStrict__SWIG_0(swigCPtr, strict);
  }

  public new void setStrict() {
    yarpPINVOKE.TypedReaderImageMono16_setStrict__SWIG_1(swigCPtr);
  }

  public new ImageMono16 read(bool shouldWait) {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageMono16_read__SWIG_0(swigCPtr, shouldWait);
    ImageMono16 ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageMono16(cPtr, false);
    return ret;
  }

  public new ImageMono16 read() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageMono16_read__SWIG_1(swigCPtr);
    ImageMono16 ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageMono16(cPtr, false);
    return ret;
  }

  public virtual void interrupt() {
    yarpPINVOKE.TypedReaderImageMono16_interrupt(swigCPtr);
  }

  public new ImageMono16 lastRead() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageMono16_lastRead(swigCPtr);
    ImageMono16 ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageMono16(cPtr, false);
    return ret;
  }

  public new bool isClosed() {
    bool ret = yarpPINVOKE.TypedReaderImageMono16_isClosed(swigCPtr);
    return ret;
  }

  public new void useCallback(TypedReaderCallbackImageMono16 callback) {
    yarpPINVOKE.TypedReaderImageMono16_useCallback(swigCPtr, TypedReaderCallbackImageMono16.getCPtr(callback));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public virtual void disableCallback() {
    yarpPINVOKE.TypedReaderImageMono16_disableCallback(swigCPtr);
  }

  public new int getPendingReads() {
    int ret = yarpPINVOKE.TypedReaderImageMono16_getPendingReads(swigCPtr);
    return ret;
  }

  public virtual string getName() {
    string ret = yarpPINVOKE.TypedReaderImageMono16_getName(swigCPtr);
    return ret;
  }

  public new void setReplier(PortReader reader) {
    yarpPINVOKE.TypedReaderImageMono16_setReplier(swigCPtr, PortReader.getCPtr(reader));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public virtual SWIGTYPE_p_void acquire() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageMono16_acquire(swigCPtr);
    SWIGTYPE_p_void ret = (cPtr == global::System.IntPtr.Zero) ? null : new SWIGTYPE_p_void(cPtr, false);
    return ret;
  }

  public virtual void release(SWIGTYPE_p_void handle) {
    yarpPINVOKE.TypedReaderImageMono16_release(swigCPtr, SWIGTYPE_p_void.getCPtr(handle));
  }

  public new void setTargetPeriod(double period) {
    yarpPINVOKE.TypedReaderImageMono16_setTargetPeriod(swigCPtr, period);
  }

}
