//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class PixelRgb : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal PixelRgb(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(PixelRgb obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~PixelRgb() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_PixelRgb(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public byte r {
    set {
      yarpPINVOKE.PixelRgb_r_set(swigCPtr, value);
    } 
    get {
      byte ret = yarpPINVOKE.PixelRgb_r_get(swigCPtr);
      return ret;
    } 
  }

  public byte g {
    set {
      yarpPINVOKE.PixelRgb_g_set(swigCPtr, value);
    } 
    get {
      byte ret = yarpPINVOKE.PixelRgb_g_get(swigCPtr);
      return ret;
    } 
  }

  public byte b {
    set {
      yarpPINVOKE.PixelRgb_b_set(swigCPtr, value);
    } 
    get {
      byte ret = yarpPINVOKE.PixelRgb_b_get(swigCPtr);
      return ret;
    } 
  }

  public PixelRgb() : this(yarpPINVOKE.new_PixelRgb__SWIG_0(), true) {
  }

  public PixelRgb(byte n_r, byte n_g, byte n_b) : this(yarpPINVOKE.new_PixelRgb__SWIG_1(n_r, n_g, n_b), true) {
  }

}
